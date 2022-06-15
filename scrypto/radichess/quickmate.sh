set -x

resim reset

OP1=$(resim new-account)
export redfoo_privkey=$(echo "$OP1" | sed -nr "s/Private key: ([[:alnum:]_]+)/\1/p")
export redfoo_account=$(echo "$OP1" | sed -nr "s/Account component address: ([[:alnum:]_]+)/\1/p")

OP2=$(resim new-account)
export rock_privkey=$(echo "$OP2" | sed -nr "s/Private key: ([[:alnum:]_]+)/\1/p")
export rock_account=$(echo "$OP2" | sed -nr "s/Account component address: ([[:alnum:]_]+)/\1/p")

export package=$(resim publish . | sed -nr "s/Success! New Package: ([[:alnum:]_]+)/\1/p")

CP_OP=$(resim call-function $package RadiChess create)
export chessmgr=$(echo "$CP_OP" | sed -nr "s/└─ Component: ([[:alnum:]_]+)/\1/p")
export badgerez=$(echo "$CP_OP" | sed -nr "s/.*Resource: ([[:alnum:]_]+)/\1/p" | sed '2!d')

resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $chessmgr register_player "RedFoo" 1700
resim set-default-account $rock_account $rock_privkey
resim call-method $chessmgr register_player "Rock" 1500

# Now Rock starts the game and will play Black
GM_OP=$(resim call-method $chessmgr start_game 1,$badgerez)
export game1=$(echo "$GM_OP" | sed -nr "s/└─ Component: ([[:alnum:]_]+)/\1/p")

# RedFoo joins the game and makes the first move as White
resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $game1 join 1,$badgerez
resim call-method $game1 move_piece "E2" "E4" 1,$badgerez
resim set-default-account $rock_account $rock_privkey
resim call-method $game1 move_piece "E7" "E5" 1,$badgerez

resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $game1 move_piece "F1" "C4" 1,$badgerez
resim set-default-account $rock_account $rock_privkey
resim call-method $game1 move_piece "B8" "C6" 1,$badgerez

resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $game1 move_piece "D1" "H5" 1,$badgerez
resim set-default-account $rock_account $rock_privkey
resim call-method $game1 move_piece "G8" "F6" 1,$badgerez

resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $game1 move_piece "H5" "F7" 1,$badgerez
# resim set-default-account $rock_account $rock_privkey
# resim call-method $game1 move_piece "A7" "A6" 1,$badgerez