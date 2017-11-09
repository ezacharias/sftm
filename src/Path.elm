module Path exposing (..)

import Json.Encode as Encode exposing (Value)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as DecodePipeline
import Utilities exposing (unsafeTail)


type alias Path =
    List PathNode


type PathNode
    = GoLeft
    | GoRight



-- The path movent commands are unchecked.


out : Path -> Path
out p =
    p |> List.reverse |> unsafeTail |> List.reverse


left : Path -> Path
left p =
    p |> List.reverse |> (::) GoLeft |> List.reverse


right : Path -> Path
right p =
    p |> List.reverse |> (::) GoRight |> List.reverse


encoder : Path -> Value
encoder path =
    Encode.list (List.map pathNodeEncoder path)


pathNodeEncoder : PathNode -> Value
pathNodeEncoder x =
    case x of
        GoLeft ->
            Encode.string "left"

        GoRight ->
            Encode.string "right"


decoder : Decoder Path
decoder =
    let
        continue s =
            case s of
                "left" ->
                    Decode.succeed GoLeft

                "right" ->
                    Decode.succeed GoRight

                _ ->
                    Decode.fail "path"
    in
        Decode.list (Decode.string |> Decode.andThen continue)
