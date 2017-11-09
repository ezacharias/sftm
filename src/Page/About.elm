module Page.About exposing (..)

import Graphics
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


view : a -> Int -> Html a
view msg version =
    div [ class "content-body" ]
        [ div [ class "nav-bar" ]
            [ button [ class "nav-bar-button", title "Back", onClick msg ] [ Graphics.leftAngle ] ]
        , div [ class "grow" ] []
        , div [ class "about-box" ]
            [ div [ class "about-title" ]
                [ text "Sympathy for the Machine" ]
            , div [ class "about-version" ]
                [ text <| "version " ++ toString version ]
            , div [ class "about-created" ]
                [ text "Made by Edwin Zacharias" ]
            , div [ class "about-email" ]
                [ a [ href "mailto:sftm@schlussweisen.com" ]
                    [ text "sftm@schlussweisen.com" ]
                ]
            ]
        , div [ class "grow-2" ] []
        , div [ class "about-copyright" ]
            [ text "Copyright © 2017 Edwin Zacharias. All rights reserved." ]
        ]
