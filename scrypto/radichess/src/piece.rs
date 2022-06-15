use scrypto::prelude::*;

/// Represents the class that a specific chess piece belongs to
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Encode, Decode, TypeId, Describe)]
#[repr(u8)]
pub enum PieceClass {
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
}

/// Represents the two teams which can exist in a game of chess
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Encode, Decode, TypeId, Describe)]
#[repr(u8)]
pub enum Team {
    Black,
    White,
}

impl Team {
    pub fn other(&self) -> Self {
        match self {
            Self::Black => Self::White,
            Self::White => Self::Black,
        }
    }
}

/// Represents a chess piece belonging to a specific team
#[derive(Debug, Clone, Copy, Encode, Decode, TypeId, Describe)]
pub struct Piece {
    class: PieceClass,
    team: Team,
    number_of_moves: u8,
}

impl Piece {
    pub fn new(piece_class: PieceClass, piece_team: Team) -> Self {
        Self {
            class: piece_class,
            team: piece_team,
            number_of_moves: 0,
        }
    }

    pub fn class(&self) -> PieceClass {
        self.class
    }

    pub fn team(&self) -> Team {
        self.team
    }

    pub fn number_of_moves(&self) -> u8 {
        self.number_of_moves
    }

    pub fn is_first_move(&self) -> bool {
        return self.number_of_moves == 0;
    }

    pub fn add_move(&mut self) {
        self.number_of_moves += 1;
    }
}

impl std::fmt::Display for Piece {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self.class {
            PieceClass::King => match self.team {
                Team::Black => write!(f, "{}", "♚"),
                Team::White => write!(f, "{}", "♔"),
            },
            PieceClass::Queen => match self.team {
                Team::Black => write!(f, "{}", "♛"),
                Team::White => write!(f, "{}", "♕"),
            },
            PieceClass::Rook => match self.team {
                Team::Black => write!(f, "{}", "♜"),
                Team::White => write!(f, "{}", "♖"),
            },
            PieceClass::Bishop => match self.team {
                Team::Black => write!(f, "{}", "♝"),
                Team::White => write!(f, "{}", "♗"),
            },
            PieceClass::Knight => match self.team {
                Team::Black => write!(f, "{}", "♞"),
                Team::White => write!(f, "{}", "♘"),
            },
            PieceClass::Pawn => match self.team {
                Team::Black => write!(f, "{}", "♟"),
                Team::White => write!(f, "{}", "♙"),
            },
        }
    }
}

impl Into<char> for Piece {
    fn into(self) -> char {
        match (self.class(), self.team()) {
            (PieceClass::Pawn, Team::White) => 'P',
            (PieceClass::Pawn, Team::Black) => 'p',

            (PieceClass::Rook, Team::White) => 'R',
            (PieceClass::Rook, Team::Black) => 'r',

            (PieceClass::Knight, Team::White) => 'N',
            (PieceClass::Knight, Team::Black) => 'n',

            (PieceClass::Bishop, Team::White) => 'B',
            (PieceClass::Bishop, Team::Black) => 'b',

            (PieceClass::Queen, Team::White) => 'Q',
            (PieceClass::Queen, Team::Black) => 'q',

            (PieceClass::King, Team::White) => 'K',
            (PieceClass::King, Team::Black) => 'k',
        }
    }
}

impl TryFrom<char> for Piece {
    type Error = &'static str;

    fn try_from(character: char) -> Result<Self, Self::Error> {
        match character {
            'P' => Ok(Self::new(PieceClass::Pawn, Team::White)),
            'p' => Ok(Self::new(PieceClass::Pawn, Team::Black)),

            'R' => Ok(Self::new(PieceClass::Rook, Team::White)),
            'r' => Ok(Self::new(PieceClass::Rook, Team::Black)),

            'N' => Ok(Self::new(PieceClass::Knight, Team::White)),
            'n' => Ok(Self::new(PieceClass::Knight, Team::Black)),

            'B' => Ok(Self::new(PieceClass::Bishop, Team::White)),
            'b' => Ok(Self::new(PieceClass::Bishop, Team::Black)),

            'Q' => Ok(Self::new(PieceClass::Queen, Team::White)),
            'q' => Ok(Self::new(PieceClass::Queen, Team::Black)),

            'K' => Ok(Self::new(PieceClass::King, Team::White)),
            'k' => Ok(Self::new(PieceClass::King, Team::Black)),

            _ => Err("Not a valid character"),
        }
    }
}
