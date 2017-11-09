module Step exposing (..)

import Term exposing (Term)
import Json.Encode exposing (Value)
import Json.Decode exposing (Decoder)
import Json.Decode.Pipeline


type alias Step =
    { rule : Int
    , isReversed : Bool
    , term : Term
    }


encoder : Step -> Value
encoder x =
    Json.Encode.object
        [ ( "rule", Json.Encode.int x.rule )
        , ( "isReversed", Json.Encode.bool x.isReversed )
        , ( "term", Term.encoder x.term )
        ]


decoder : Decoder Step
decoder =
    Json.Decode.Pipeline.decode Step
        |> Json.Decode.Pipeline.required "rule" Json.Decode.int
        |> Json.Decode.Pipeline.required "isReversed" Json.Decode.bool
        |> Json.Decode.Pipeline.required "term" Term.decoder
