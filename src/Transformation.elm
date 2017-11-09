module Transformation exposing (..)

import Term exposing (Term)
import Rule exposing (Rule)


{-| This is just enough information to allow display and clicking on
transformations in the transformation panel. If the transformation is multiple,
the options must be recalculated by the transformation panel.
-}
type alias Transformation =
    -- display is the term used to replace the focus when clicking on a
    -- transformation. Any metavariables which do not require choosing have been
    -- substituted.
    { display : Term
    , isMultiple : Bool
    , isReversed : Bool
    , ruleIndex : Int
    }
