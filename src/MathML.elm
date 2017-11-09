module MathML exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)


math : List (Attribute msg) -> List (Html msg) -> Html msg
math attrs =
    node "math" (attribute "xmlns" "http://www.w3.org/1998/Math/MathML" :: attrs)


mi : List (Attribute msg) -> List (Html msg) -> Html msg
mi =
    node "mi"


mo : List (Attribute msg) -> List (Html msg) -> Html msg
mo =
    node "mo"
