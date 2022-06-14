use crate::coordinate::{Coordinate, CoordinatePath};
use crate::piece::{Piece, PieceClass, Team};
use std::collections::HashMap;
use itertools::Itertools;
use regex::Regex;
use sbor::Decode;
use scrypto::prelude::*;

/// Represents the current chess board with all of its pieces
#[derive(Debug, Encode, Decode, TypeId, Describe)]
pub struct Board {
    /// A two dimensional array of the actual board.
    map: [[Option<Piece>; 8]; 8],

    /// A graveyard for all of the pieces which have been removed.
    graveyard: Vec<Piece>,

    /// The total number of moves which have been made on the board by each team
    team_moves: HashMap<Team, u16>,

    /// Multiple history nodes which together create a history of all of the actions which happened on the board.
    history: Vec<HistoryNode>,

    /// Represents the team which has the turn to play.
    turn_to_play: Team
}

impl Board {
    /// Creates a new default board
    pub fn new() -> Self {
        let mut board: Self = Self::default();

        // Setting all of the pieces fo their correct place
        for (row_index, team) in [(0, Team::Black), (7, Team::White)] {
            for (i, item_class) in [
                PieceClass::Rook,
                PieceClass::Knight,
                PieceClass::Bishop,
                PieceClass::King,
                PieceClass::Queen,
                PieceClass::Bishop,
                PieceClass::Knight,
                PieceClass::Rook,
            ]
            .iter()
            .enumerate()
            {
                board.set_piece(
                    &Coordinate::try_from((row_index, i)).unwrap(),
                    Some(Piece::new(item_class.clone(), team)),
                );
            }
        }

        for (row_index, team) in [(1, Team::Black), (6, Team::White)] {
            for i in 0u8..8u8 {
                board.set_piece(
                    &Coordinate::try_from((row_index, i)).unwrap(),
                    Some(Piece::new(PieceClass::Pawn, team)),
                );
            }
        }

        board
    }

    pub fn new_with_fen(fen: Fen) -> Self {
        let mut board: Self = Default::default();

        let board_pieces_state: String = fen.board_pieces_state();
        for (row_index, row_data) in board_pieces_state.split('/').enumerate() {
            let mut column_index: usize = 0;
            for char in row_data.chars() {
                if char.is_alphabetic() {
                    let piece: Piece = Piece::try_from(char).unwrap();
                    board.set_piece(&Coordinate::try_from((row_index, column_index)).unwrap(), Some(piece));
                    column_index += 1;
                } else if char.is_numeric() {
                    let amount: u32 = char.to_digit(10).unwrap();
                    for _ in 0..amount {
                        board.set_piece(&Coordinate::try_from((row_index, column_index)).unwrap(), None);
                        column_index += 1;
                    }
                } else {
                    panic!("Got a symbol in the FEN");
                }
            }
        }

        if fen.current_team_turn() != board.turn_to_play() {
            board.toggle_turn_to_play();
        }

        return board
    }

    pub fn try_new_with_history(history: Vec<HistoryNode>) -> Result<Self, BoardError> {
        let mut board: Self = Self::new();

        for node in history.iter() {
            board.move_piece(&node.from, &node.to)?;
        }

        Ok(board)
    } 

    fn remove_piece(&mut self, coordinate: &Coordinate) -> Result<(), BoardError> {
        let piece: Option<Piece> = self.get_piece(coordinate);

        match piece {
            Some(piece) => {
                self.graveyard.push(piece);
                self.set_piece(coordinate, None);
                Ok(())
            }
            None => Err(BoardError::EmptyCoordinate),
        }
    }

    fn set_piece(&mut self, coordinate: &Coordinate, piece: Option<Piece>) {
        self.map[coordinate.row()][coordinate.column()] = piece;
    }

    pub fn get_piece(&self, coordinate: &Coordinate) -> Option<Piece> {
        self.map[coordinate.row()][coordinate.column()]
    }

    pub fn map(&self) -> [[Option<Piece>; 8]; 8] {
        self.map
    }

    pub fn graveyard(&self) -> Vec<Piece> {
        self.graveyard.clone()
    }

    pub fn team_moves(&self) -> HashMap<Team, u16> {
        self.team_moves.clone()
    }

    pub fn turn_to_play(&self) -> Team {
        self.turn_to_play
    }

    fn toggle_turn_to_play(&mut self) {
        self.turn_to_play = match self.turn_to_play {
            Team::White => Team::Black,
            Team::Black => Team::White
        }
    }

    pub fn team_at_coordinate(&self, coordinate: &Coordinate) -> Option<Team> {
        match self.get_piece(coordinate) {
            Some(piece) => Some(piece.team()),
            None => None
        }
    }

    /// Moves a piece from one coordinate to another coordinate. Checks that the move is legal before performing the 
    /// move.
    pub fn move_piece(
        &mut self,
        from: &Coordinate,
        to: &Coordinate
    ) -> Result<(), BoardError> {
        // Getting the piece at the specified coordinate.
        let mut piece: Piece = {
            match self.get_piece(from) {
                Some(piece) => Ok(piece),
                None => Err(BoardError::EmptyCoordinate),
            }
        }?;

        // Check if this piece is of the team that is currently allowed to play, if not then return an error
        if piece.team() != self.turn_to_play {
            return Err(BoardError::NotYourTurn)
        }

        // Getting all of the legal moves for this piece
        let legal_moves: HashMap<Coordinate, Option<Coordinate>> = self.piece_legal_moves(from).unwrap();

        // If true, then this is a legal move and we can go ahead with the removal of the old item.
        if legal_moves.contains_key(to) {
            // If there is an item to destroy, go ahead and destroy it.
            match legal_moves.get(from) {
                Some(to_destroy_coordinate) => {
                    self.remove_piece(&to_destroy_coordinate.unwrap())?;
                },
                None => {}
            }

            // Perform the move operation
            piece.add_move();
            self.set_piece(to, Some(piece));
            self.set_piece(from, None);

            // Adding this move to the total number of moves made
            *self.team_moves.get_mut(&piece.team()).unwrap() += 1;

            // Adding the move to the history of the match
            self.history.push(HistoryNode { piece: piece, from: from.clone(), to: to.clone() });

            // Toggle the teams
            self.toggle_turn_to_play();

            // If an upgrade can happen, then switch the pawn with a queen.
            // TODO: Add a way to select what gets promoted.
            if (to.row() == 0 || to.row() == 7) && matches!(piece.class(), PieceClass::Pawn) {
                self.set_piece(to, Some(Piece::new(PieceClass::Queen, piece.team())));
            }

            Ok(())
        } else {
            Err(BoardError::IllegalMove)
        }
    }

    /// This method gets all of the legal moves that a specific piece from a specific coordinate is allowed to make and
    /// returns it as well as the coordinate of the items to be removed if the piece is moved to this coordinate.
    ///
    /// Therefore, the HashMap returned is:
    ///
    /// HashMap<Coordinate, Option<Coordinate>
    ///              │                 │
    ///              │                 └ If the move is made, this piece will be removed in the process.
    ///              └ A coordinate that the piece is allowed to move to
    pub fn piece_legal_moves(
        &self,
        coordinate: &Coordinate,
    ) -> Result<HashMap<Coordinate, Option<Coordinate>>, BoardError> {
        // Getting the piece at the specified coordinate.
        let piece: Piece = {
            match self.get_piece(coordinate) {
                Some(piece) => Ok(piece),
                None => Err(BoardError::EmptyCoordinate),
            }
        }?;

        // This is the HashMap that will be returned. The following match statement will only modify this HashMap, it
        // wont create a new one.
        let mut legal_moves: HashMap<Coordinate, Option<Coordinate>> = HashMap::new();

        // The logic depends on the type of the piece that we're checking for.
        match piece.class() {
            PieceClass::Knight => {
                // The night only has a set of coordinates that they can move to, nothing else. Here we calculate the
                // possible coordinate offsets that they can move to.
                let coordinates: Vec<Coordinate> = vec![1, 2, -1, -2]
                    .iter()
                    .cloned()
                    .permutations(2)
                    .filter(|perm| perm.iter().map(|n| i8::abs(*n)).sum::<i8>() == 3)
                    .map(|offsets| {
                        let row_offset: i8 = offsets[0];
                        let column_offset: i8 = offsets[1];

                        coordinate.checked_add_individual(row_offset, column_offset)
                    })
                    .filter(|maybe_coordinate| maybe_coordinate.is_ok())
                    .map(|x| x.unwrap())
                    .collect();

                // Go over the coordinates and ensure that the knight can only move to coordinates where no friendlies
                // are
                for single_coordinate in coordinates.into_iter() {
                    match self.get_piece(&single_coordinate) {
                        Some(other_piece) => {
                            if other_piece.team() != piece.team() {
                                legal_moves.insert(
                                    single_coordinate.clone(),
                                    Some(single_coordinate.clone()),
                                );
                            }
                        }
                        None => {
                            legal_moves.insert(single_coordinate, None);
                        }
                    }
                }
            }
            // These pieces will all follow the same logic of CoordinatePaths but will be using different paths. So, it
            // is better to group their logic into one single place to be able to use it quickly.
            PieceClass::Bishop | PieceClass::Rook | PieceClass::Queen | PieceClass::King => {
                let paths: Vec<CoordinatePath> = {
                    match piece.class() {
                        PieceClass::Bishop => vec![-1, -1, 1, 1]
                            .iter()
                            .cloned()
                            .permutations(2)
                            .unique()
                            .map(|multipliers| {
                                let row_multiplier: i8 = multipliers[0];
                                let column_multiplier: i8 = multipliers[1];

                                (1..8)
                                    .map(|n| {
                                        (n.clone() * row_multiplier, n.clone() * column_multiplier)
                                    })
                                    .collect::<Vec<(i8, i8)>>()
                            })
                            .map(|offsets_vec| {
                                offsets_vec
                                    .iter()
                                    .map(|(row_offset, column_offset)| {
                                        coordinate
                                            .checked_add_individual(*row_offset, *column_offset)
                                    })
                                    .filter(|maybe_coordinate| maybe_coordinate.is_ok())
                                    .map(|x| x.unwrap())
                                    .collect()
                            })
                            .collect::<Vec<CoordinatePath>>(),
                        PieceClass::Rook => vec![-1, 1]
                            .iter()
                            .cloned()
                            .flat_map(|multiplier| {
                                vec![
                                    (1..8)
                                        .map(|n| (0, n.clone() * multiplier))
                                        .collect::<Vec<(i8, i8)>>(),
                                    (1..8)
                                        .map(|n| (n.clone() * multiplier, 0))
                                        .collect::<Vec<(i8, i8)>>(),
                                ]
                            })
                            .map(|offsets_vec| {
                                offsets_vec
                                    .iter()
                                    .map(|(row_offset, column_offset)| {
                                        coordinate
                                            .checked_add_individual(*row_offset, *column_offset)
                                    })
                                    .filter(|maybe_coordinate| maybe_coordinate.is_ok())
                                    .map(|x| x.unwrap())
                                    .collect()
                            })
                            .collect::<Vec<CoordinatePath>>(),
                        PieceClass::Queen | PieceClass::King => {
                            let end: i8 = if matches!(piece.class(), PieceClass::Queen) {
                                8
                            } else {
                                2
                            };
                            vec![-1, 1]
                                .iter()
                                .cloned()
                                .flat_map(|multiplier| {
                                    vec![
                                        (1..end)
                                            .map(|n| (0, n.clone() * multiplier))
                                            .collect::<Vec<(i8, i8)>>(),
                                        (1..end)
                                            .map(|n| (n.clone() * multiplier, 0))
                                            .collect::<Vec<(i8, i8)>>(),
                                    ]
                                })
                                .map(|offsets_vec| {
                                    offsets_vec
                                        .iter()
                                        .map(|(row_offset, column_offset)| {
                                            coordinate
                                                .checked_add_individual(*row_offset, *column_offset)
                                        })
                                        .filter(|maybe_coordinate| maybe_coordinate.is_ok())
                                        .map(|x| x.unwrap())
                                        .collect()
                                })
                                .chain(
                                    vec![-1, -1, 1, 1]
                                        .iter()
                                        .cloned()
                                        .permutations(2)
                                        .unique()
                                        .map(|multipliers| {
                                            let row_multiplier: i8 = multipliers[0];
                                            let column_multiplier: i8 = multipliers[1];

                                            (1..end)
                                                .map(|n| {
                                                    (
                                                        n.clone() * row_multiplier,
                                                        n.clone() * column_multiplier,
                                                    )
                                                })
                                                .collect::<Vec<(i8, i8)>>()
                                        })
                                        .map(|offsets_vec| {
                                            offsets_vec
                                                .iter()
                                                .map(|(row_offset, column_offset)| {
                                                    coordinate.checked_add_individual(
                                                        *row_offset,
                                                        *column_offset,
                                                    )
                                                })
                                                .filter(|maybe_coordinate| maybe_coordinate.is_ok())
                                                .map(|x| x.unwrap())
                                                .collect()
                                        }),
                                )
                                .collect::<Vec<CoordinatePath>>()
                        }
                        _ => {
                            panic!("Impossible case occurred.")
                        }
                    }
                };

                for path in paths.into_iter() {
                    for single_coordinate in path.into_iter() {
                        match self.get_piece(&single_coordinate) {
                            Some(other_piece) => {
                                if other_piece.team() != piece.team() {
                                    legal_moves.insert(
                                        single_coordinate.clone(),
                                        Some(single_coordinate.clone()),
                                    );
                                }
                                break;
                            }
                            None => {
                                legal_moves.insert(single_coordinate, None);
                            }
                        }
                    }
                }
            }
            PieceClass::Pawn => {
                // Determine the direction of allowed movements depending on the team
                let single_pawn_move: i8 = match piece.team() {
                    Team::Black => 1,
                    Team::White => -1,
                };

                // Single pawn move
                let mut is_single_move_legal: bool = false;
                match coordinate.checked_add_individual(single_pawn_move, 0) {
                    Ok(single_coordinate) => {
                        match self.get_piece(&single_coordinate) {
                            Some(_) => { }
                            None => {
                                legal_moves.insert(single_coordinate, None);
                                is_single_move_legal = true;
                            }
                        }
                    },
                    Err(_) => {}
                }

                // Two pawn move
                if piece.is_first_move() && is_single_move_legal {
                    match coordinate.checked_add_individual(single_pawn_move * 2, 0) {
                        Ok(single_coordinate) => {
                            match self.get_piece(&single_coordinate) {
                                Some(_) => { }
                                None => {
                                    legal_moves.insert(single_coordinate, None);
                                }
                            }
                        },
                        Err(_) => {}
                    }
                }

                // Pawn's attack move
                for column_offset in [-1, 1] {
                    match coordinate.checked_add_individual(single_pawn_move, column_offset) {
                        Ok(single_coordinate) => {
                            match self.get_piece(&single_coordinate) {
                                Some(other_piece) => { 
                                    if other_piece.team() != piece.team() {
                                        legal_moves.insert(
                                            single_coordinate.clone(),
                                            Some(single_coordinate.clone()),
                                        );
                                    }
                                }
                                None => {
                                    legal_moves.insert(single_coordinate, None);
                                }
                            }
                        },
                        Err(_) => {}
                    }
                }

                // En Passant rule
                for column_offset in [-1, 1] {
                    match coordinate.checked_add_individual(0, column_offset) {
                        Ok(single_coordinate) => {
                            match self.get_piece(&single_coordinate) {
                                Some(other_piece) => { 
                                    if other_piece.number_of_moves() == 1 && matches!(other_piece.class(), PieceClass::Pawn) {
                                        if other_piece.team() != piece.team() {
                                            legal_moves.insert(
                                                single_coordinate.checked_add_individual(single_pawn_move, 0).unwrap(),
                                                Some(single_coordinate.clone()),
                                            );
                                        }
                                    }
                                }
                                None => {
                                    legal_moves.insert(single_coordinate, None);
                                }
                            }
                        },
                        Err(_) => {}
                    }
                }
            } 
        }

        return Ok(legal_moves);
    }

    /// Checks if a winner is ready to be declared, declares them the winner, and returns the team which won.
    pub fn winner(&self) -> Option<Team> {
        let kings: Vec<Piece> = self.map
            .iter()
            .flatten()
            .cloned()
            .filter(|x| x.is_some())
            .map(|x| x.unwrap())
            .filter(|x| matches!(x.class(), PieceClass::King))
            .collect::<Vec<Piece>>();

        // Do we have two kings? If so then no winner can be declared
        if kings.len() == 2 {
            None
        } else if kings.len() == 1 {
            let king: Piece = *kings.get(0).unwrap();
            Some(king.team())
        } else {
            panic!("Impossible case")
        }
    }

    pub fn fen(&self) -> Fen {
        let mut fen_string: String = String::new();

        // Adding the row states
        for row in self.map() {
            for item in row.iter() {
                match item {
                    Some(piece) => {
                        fen_string.push(piece.clone().into())
                    },
                    None => { fen_string.push('1') }
                }
            }
            fen_string.push('/');
        }
        fen_string = fen_string.trim_end_matches(&['/']).to_string();

        // Find all of the repeating ones and replace them with their total
        let re: Regex = Regex::new(r"(1+)").unwrap();
        let replacement_map: Vec<(String, usize)> = re.find_iter(&fen_string)
            .filter_map(|digits| digits.as_str().parse().ok())
            .map(|x: String| (x.clone(), x.len()))
            .unique()
            .sorted_by(|a, b| a.1.cmp(&b.1))
            .rev()
            .collect();
        
        for (key, value) in replacement_map.iter() {
            fen_string = fen_string.replace(key, value.to_string().as_str()).to_string();
        }
        
        // Adding the final additional information
        fen_string.push(' ');
        match self.turn_to_play {
            Team::White => fen_string.push('w'),
            Team::Black => fen_string.push('b'),
        }

        fen_string.push_str(format!(" - - 0 {}", self.history.len() + 1).as_str());

        Fen { state: fen_string }
    }
}

impl Default for Board {
    /// Creates a new empty vault
    fn default() -> Self {
        let mut default_hashmap: HashMap<Team, u16> = HashMap::new();
        default_hashmap.insert(Team::Black, 0);
        default_hashmap.insert(Team::White, 0);

        Self {
            map: Default::default(),
            graveyard: Vec::new(),
            team_moves: default_hashmap,
            history: Vec::new(),
            turn_to_play: Team::White
        }
    }
}

#[derive(Debug)]
pub enum BoardError {
    EmptyCoordinate,
    IllegalMove,
    NotYourTurn
}

impl std::fmt::Display for Board {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for (row_number, row) in self.map().iter().enumerate() {
            write!(f, "{} ┃ ", 8 - row_number)?;
            for item in row.iter() {
                write!(
                    f,
                    "{} ",
                    match item {
                        Some(item) => format!("{}", item),
                        None => format!("."),
                    }
                )?
            }
            write!(f, "\n")?;
        }
        write!(f, "  ┗━━━━━━━━━━━━━━━━\n")?;
        write!(f, "    ")?;
        for letter in 'A'..'I' {
            write!(f, "{} ", letter)?;
        }
        std::fmt::Result::Ok(())
    }
}

/// Represents a point in the history of the game with information on which pieces moved to which locations
#[derive(Debug, Encode, Decode, TypeId, Describe)]
pub struct HistoryNode {
    pub piece: Piece,
    pub from: Coordinate,
    pub to: Coordinate,
}

/// A Fen representation of the state of a chess board
#[derive(Debug)]
pub struct Fen {
    pub state: String
}

impl Fen {
    pub fn board_pieces_state(&self) -> String {
        self.state.split(' ').nth(0).unwrap().to_string()
    }

    // TODO: this should return a result team to handle the case of incorrect character
    pub fn current_team_turn(&self) -> Team {
        match self.state.split(' ').nth(1).unwrap().to_string().chars().nth(0).unwrap() {
            'w' | 'W' => Team::White,
            'b' | 'B' => Team::Black,
            _ => panic!("Invalid team")
        }
    }
}