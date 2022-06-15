Testing RadiChess and Chess blueprints

resim reset
resim new-account 
    export redfoo_account=<ACCOUNT>
    export redfoo_privkey=<PRIVKEY>
resim new-account 
    export rock_account=<ACCOUNT>
    export rock_privkey=<PRIVKEY>
resim publish .
    export package=<PACKAGE>

resim call-function $package RadiChess create
    export chessmgr=<COMPONENTADDR>
    export badgerez=<BADGE_RESOURCE> # The second listed RESOURCE

resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $chessmgr register_player RedFoo 1700
resim set-default-account $rock_account $rock_privkey
resim call-method $chessmgr register_player Rock 1500

resim call-method $chessmgr start_game 1,$badgerez
    export game1=<COMPONENTADDR>
resim set-default-account $redfoo_account $redfoo_privkey
resim call-method $game1 join 1,$badgerez
resim call-method move_piece E2 E4 1,$badgerez
