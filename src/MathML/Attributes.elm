module MathML.Attributes exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)


mathvariant : String -> Attribute msg
mathvariant =
    attribute "mathvariant"
