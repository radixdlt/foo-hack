use scrypto::prelude::*;

pub type CoordinatePath = Vec<Coordinate>;

/// A struct that represents a coordinate in the chess board. Implements a number of useful methods and traits that allow
/// this struct to be initialized from different types.
///
/// A coordinate is designed such that it is always correct and can not be invalid for any 8x8 chess board.
#[derive(Debug, Hash, PartialEq, Eq, Clone, Copy, Encode, Decode, TypeId, Describe)]
pub struct Coordinate {
    row: u8,
    column: u8,
}

impl Coordinate {
    pub fn row(&self) -> usize {
        self.row as usize
    }

    pub fn column(&self) -> usize {
        self.column as usize
    }

    pub fn checked_add(&self, other: Self) -> Result<Self, CoordinateError> {
        let row: i8 = self.row as i8 + other.row as i8;
        let column: i8 = self.column as i8 + other.column as i8;

        if !self.valid_within_board_bound(row) || !self.valid_within_board_bound(column) {
            Err(CoordinateError::CoordinateOverflow)
        } else {
            Ok(Self {
                row: row as u8,
                column: column as u8,
            })
        }
    }

    pub fn checked_subtract(&self, other: Self) -> Result<Self, CoordinateError> {
        let row: i8 = self.row as i8 - other.row as i8;
        let column: i8 = self.column as i8 - other.column as i8;

        if !self.valid_within_board_bound(row) || !self.valid_within_board_bound(column) {
            Err(CoordinateError::CoordinateUnderflow)
        } else {
            Ok(Self {
                row: row as u8,
                column: column as u8,
            })
        }
    }

    pub fn checked_add_individual(&self, row: i8, column: i8) -> Result<Self, CoordinateError> {
        let row: i8 = self.row as i8 + row;
        let column: i8 = self.column as i8 + column;

        if !self.valid_within_board_bound(row) || !self.valid_within_board_bound(column) {
            Err(CoordinateError::CoordinateOverflow)
        } else {
            Ok(Self {
                row: row as u8,
                column: column as u8,
            })
        }
    }

    pub fn checked_subtract_individual(
        &self,
        row: i8,
        column: i8,
    ) -> Result<Self, CoordinateError> {
        let row: i8 = self.row as i8 - row;
        let column: i8 = self.column as i8 - column;

        if !self.valid_within_board_bound(row) || !self.valid_within_board_bound(column) {
            Err(CoordinateError::CoordinateUnderflow)
        } else {
            Ok(Self {
                row: row as u8,
                column: column as u8,
            })
        }
    }

    fn valid_within_board_bound(&self, number: i8) -> bool {
        0 <= number && number < 8
    }
}

impl TryFrom<&str> for Coordinate {
    type Error = CoordinateError;

    fn try_from(string: &str) -> Result<Self, Self::Error> {
        // The coordinate must have a length of two
        if string.len() != 2 {
            return Err(CoordinateError::InvalidCoordinateLength);
        }

        // Getting the values of the two characters
        let column_specifier: char = string.chars().nth(0).unwrap().to_ascii_lowercase();
        let row_specifier: char = string.chars().nth(1).unwrap().to_ascii_lowercase();

        // Checking that the two characters are within the range of allowed characters
        if !(column_specifier >= 'a' && column_specifier <= 'h') {
            return Err(CoordinateError::InvalidColumnSpecifier);
        }
        if !(row_specifier >= '1' && row_specifier <= '8') {
            return Err(CoordinateError::InvalidRowSpecifier);
        }

        Ok(Self {
            row: '8' as u8 - (row_specifier as u8),
            column: column_specifier as u8 - 'a' as u8,
        })
    }
}

impl TryFrom<String> for Coordinate {
    type Error = CoordinateError;

    fn try_from(string: String) -> Result<Self, Self::Error> {
        Self::try_from(string.as_str())
    }
}

macro_rules! indices_try_from {
    ( $data_type:ident ) => {
        impl TryFrom<($data_type, $data_type)> for Coordinate {
            type Error = CoordinateError;

            fn try_from(coordinate: ($data_type, $data_type)) -> Result<Self, Self::Error> {
                // Make sure that the provided number fits within the required range
                if coordinate.0 >= 8 {
                    return Err(CoordinateError::InvalidRowSpecifier);
                } else if coordinate.1 >= 8 {
                    return Err(CoordinateError::InvalidColumnSpecifier);
                } else {
                    Ok(Self {
                        row: coordinate.0 as u8,
                        column: coordinate.1 as u8,
                    })
                }
            }
        }

        impl TryFrom<[$data_type; 2]> for Coordinate {
            type Error = CoordinateError;

            fn try_from(coordinate: [$data_type; 2]) -> Result<Self, Self::Error> {
                // Make sure that the provided number fits within the required range
                if coordinate[0] >= 8 {
                    return Err(CoordinateError::InvalidRowSpecifier);
                } else if coordinate[1] >= 8 {
                    return Err(CoordinateError::InvalidColumnSpecifier);
                } else {
                    Ok(Self {
                        row: coordinate[0] as u8,
                        column: coordinate[1] as u8,
                    })
                }
            }
        }
    };
}

impl ToString for Coordinate {
    fn to_string(&self) -> String {
        let row_specifier: u8 = 8 - self.row;
        let column_specifier: char = ('A' as u8 + self.column) as char;

        format!("{}{}", column_specifier, row_specifier)
    }
}

indices_try_from!(u8);
indices_try_from!(u16);
indices_try_from!(u32);
indices_try_from!(u64);
indices_try_from!(u128);
indices_try_from!(usize);

/// Represents an error encountered when dealing with coordinates.
#[derive(Debug)]
pub enum CoordinateError {
    InvalidCoordinateLength,

    InvalidColumnSpecifier,
    InvalidRowSpecifier,

    CoordinateOverflow,
    CoordinateUnderflow,
}
