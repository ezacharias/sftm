module Render
    exposing
        ( formulaHtml0
        , formulaHtml1
        , formulaHtml2
        , ruleSpan
        , termSpan
        , leftRuleDiv
        , leftTermDiv
        , yellowLeftTermDiv
        , centerTermDiv
        , symbolSvg
        , starDiv
          -- Glyph stuff
        , latinUpperAHtml
        , latinUpperBHtml
        , latinUpperCHtml
        , conjunctionHtml
        , topHtml
        , turnstileHtml
        , longLeftRightArrowHtml
        , frakturAHtml
        , botHtml
        , disjunctionHtml
        , equivalenceHtml
          -- Other
        , midTermShape
        )

import Html as H exposing (Html)
import Html.Attributes as HA
import Html.Lazy exposing (lazy, lazy2, lazy3)
import Path exposing (Path)
import Rule exposing (Rule)
import Svg as S exposing (Svg, Attribute)
import Svg.Attributes as SA
import Symbol exposing (Symbol)
import Term exposing (..)
import Transformation exposing (Transformation)
import Utilities exposing (castHtml, ariaHidden)
import MathML
import MathML.Attributes


type alias Shape =
    { width : Float
    , above : Float
    , below : Float
    , svg : Transform -> List (Svg Never)
    , focus : Maybe Rect
    , assoc : Maybe Rect
    , mathML : List (Html Never)
    }


type alias Rect =
    { x : Float
    , y : Float
    , width : Float
    , above : Float
    , below : Float
    }


type alias Glyph =
    { id : String
    , ascent : Float
    , descent : Float
    , width : Float
    , xStart : Float
    , xEnd : Float
    }


type alias Transform =
    { x : Float
    , y : Float
    }


type alias Context =
    { precedence : Int
    , focusPosition : Position
    , assocPosition : Position
    }


type Position
    = Path Path
    | Inside
    | Outside


ruleShape : Rule -> Shape
ruleShape rule =
    let
        antecedents =
            if List.isEmpty rule.antecedents then
                emptyShape
            else
                horizontal (commaSep (List.map (reallyTermShape { precedence = 0, focusPosition = Inside, assocPosition = Outside }) rule.antecedents)) space

        left =
            reallyTermShape { precedence = 0, focusPosition = Inside, assocPosition = Outside } rule.left

        right =
            reallyTermShape { precedence = 0, focusPosition = Inside, assocPosition = Outside } rule.right
    in
        List.foldr horizontal emptyShape [ antecedents, turnstileShape, space, left, space, longLeftRightArrowShape, space, right ]


{-| Aligns center-left with a standard height.
-}
leftRuleDiv : Rule -> Html msg
leftRuleDiv =
    lazy (midRuleShape >> expandShape >> leftDiv)


leftDiv : Shape -> Html msg
leftDiv shape =
    H.div [ HA.class "left-svg-box" ]
        [ shapeHtml shape
        , castHtml <| H.span [ HA.style [ ( "display", "block" ), ( "overflow", "hidden" ), ( "height", "1px" ), ( "width", "1px" ) ] ] [ MathML.math [] (shape.mathML) ]
        ]


centerDiv : Shape -> Html msg
centerDiv shape =
    H.div [ HA.class "center-svg-box" ]
        [ shapeHtml shape
        , castHtml <| H.span [ HA.style [ ( "display", "block" ), ( "overflow", "hidden" ), ( "height", "1px" ), ( "width", "1px" ) ] ] [ MathML.math [] (shape.mathML) ]
        ]


expandShape : Shape -> Shape
expandShape shape =
    { shape
        | width = shape.width + expansion * 2
        , below = shape.below + expansion
        , above = shape.above + expansion
        , svg =
            \tr ->
                shape.svg
                    { tr
                        | x = tr.x + expansion
                    }
    }


expansion : Float
expansion =
    50


midRuleShape : Rule -> Shape
midRuleShape rule =
    let
        shape =
            ruleShape rule
    in
        { shape | above = midline + 750, below = 750 - midline }


horizontal : Shape -> Shape -> Shape
horizontal s1 s2 =
    { width = s1.width + s2.width
    , above = max s1.above s2.above
    , below = max s1.below s2.below
    , svg = \tr -> (s1.svg tr ++ s2.svg { x = tr.x + s1.width, y = tr.y })
    , focus = maybes s1.focus (translateRectX s1.width s2.focus)
    , assoc = maybes s1.assoc (translateRectX s1.width s2.assoc)
    , mathML = s1.mathML ++ s2.mathML
    }


space : Shape
space =
    { width = 600.0
    , above = 0.0
    , below = 0.0
    , svg = \tr -> []
    , focus = Nothing
    , assoc = Nothing
    , mathML = []
    }


emptyShape : Shape
emptyShape =
    { width = 0.0
    , above = 0.0
    , below = 0.0
    , svg = \tr -> []
    , focus = Nothing
    , assoc = Nothing
    , mathML = []
    }


commaSep : List Shape -> Shape
commaSep shapes =
    case shapes of
        [] ->
            Debug.crash "impossible"

        [ s ] ->
            s

        s :: ss ->
            let
                s_ =
                    commaSep ss

                svg tr =
                    (s.svg tr
                        ++ [ S.use [ (SA.xlinkHref commaGlyph.id), SA.x (toS (tr.x + s.width)), SA.y (toS tr.y), SA.fill "White" ] [] ]
                        ++ s_.svg { tr | x = tr.x + s.width + commaGlyph.width + 400, y = tr.y }
                    )
            in
                { width = s.width + commaGlyph.width + 400 + s_.width
                , above = max3 s.above commaGlyph.ascent s_.above
                , below = max3 s.below commaGlyph.descent s_.below
                , svg = svg
                , focus = Nothing
                , assoc = Nothing
                , mathML = List.concat (List.intersperse [ MathML.mo [] [ H.text "," ] ] (List.map (.mathML) shapes))
                }


defaultContext : Context
defaultContext =
    { precedence = 0, focusPosition = Inside, assocPosition = Outside }


symbolSvg : Symbol -> Html msg
symbolSvg =
    lazy (symbolShape >> leftDiv)


symbolShape : Symbol -> Shape
symbolShape symbol =
    case symbol of
        Symbol.Top ->
            downTackShape defaultContext

        Symbol.Bot ->
            upTackShape defaultContext

        Symbol.VarA ->
            reallyGlyphShape (-40) (0) focusColor (MathML.mi [] [ H.text "A" ]) latinUpperAGlyph

        Symbol.VarB ->
            reallyGlyphShape (-40) (0) focusColor (MathML.mi [] [ H.text "B" ]) latinUpperBGlyph

        Symbol.VarC ->
            reallyGlyphShape (-40) (0) focusColor (MathML.mi [] [ H.text "C" ]) latinUpperCGlyph

        Symbol.Negation ->
            notShape defaultContext

        Symbol.Conjunction ->
            conjunctionShape defaultContext

        Symbol.Disjunction ->
            disjunctionShape defaultContext

        Symbol.Equivalence ->
            leftRightArrowShape defaultContext

        Symbol.Implication ->
            rightArrowShape defaultContext


termShape : Term -> Shape
termShape =
    reallyTermShape { precedence = 0, focusPosition = Inside, assocPosition = Outside }


midTermShape : Term -> Shape
midTermShape term =
    let
        shape =
            termShape term
    in
        { shape | above = midline + 750, below = 750 - midline }


reallyTermShape : Context -> Term -> Shape
reallyTermShape ctx term =
    let
        shape0 =
            reallyTermShape2 ctx term

        shape1 =
            if contextIsTrueFocus ctx then
                { shape0 | focus = Just { x = 0, y = 0, width = shape0.width, above = shape0.above, below = shape0.below } }
            else
                shape0

        shape2 =
            if contextIsTrueAssoc ctx then
                { shape1 | assoc = Just { x = 0, y = 0, width = shape1.width, above = shape1.above, below = shape1.below } }
            else
                shape1

        shape3 =
            if contextIsMathML ctx then
                shape2
            else
                { shape2 | mathML = [] }
    in
        shape3


reallyTermShape2 : Context -> Term -> Shape
reallyTermShape2 ctx term =
    case term of
        Binary Equivalence t1 t2 ->
            binaryShape ctx 0 t1 (leftRightArrowShape ctx) t2

        Binary Implication t1 t2 ->
            binaryShape ctx 1 t1 (rightArrowShape ctx) t2

        Binary Disjunction t1 t2 ->
            binaryShape ctx 2 t1 (disjunctionShape ctx) t2

        Binary Conjunction t1 t2 ->
            binaryShape ctx 3 t1 (conjunctionShape ctx) t2

        Unary Not t ->
            unaryShape ctx 10 (notShape ctx) t

        Atom Top ->
            downTackShape ctx

        Atom Bot ->
            upTackShape ctx

        Atom VarA ->
            reallyGlyphShape (-40) (0) (contextColor ctx) (MathML.mi [] [ H.text "A" ]) latinUpperAGlyph

        Atom VarB ->
            reallyGlyphShape (-40) (0) (contextColor ctx) (MathML.mi [] [ H.text "B" ]) latinUpperBGlyph

        Atom VarC ->
            reallyGlyphShape (-40) (0) (contextColor ctx) (MathML.mi [] [ H.text "C" ]) latinUpperCGlyph

        Atom (MetaVar MetaA) ->
            glyphShape metaColor (MathML.mi [ MathML.Attributes.mathvariant "fraktur" ] [ H.text "A" ]) frakturAGlyph

        Atom (MetaVar MetaB) ->
            glyphShape metaColor (MathML.mi [ MathML.Attributes.mathvariant "fraktur" ] [ H.text "B" ]) frakturBGlyph

        Atom (MetaVar MetaC) ->
            glyphShape metaColor (MathML.mi [ MathML.Attributes.mathvariant "fraktur" ] [ H.text "C" ]) frakturCGlyph



-- i is the precedence required by the operator


unaryShape : Context -> Int -> Shape -> Term -> Shape
unaryShape ctx i g t =
    let
        s =
            reallyUnaryShape g (reallyTermShape (contextInRight (i + 1) ctx) t)
    in
        if 0 < ctx.precedence then
            parens ctx s
        else
            s



-- TODO: Check the focus here as far as returning mathML


binaryShape : Context -> Int -> Term -> Shape -> Term -> Shape
binaryShape ctx i t1 g t2 =
    let
        s =
            reallyBinaryShape (reallyTermShape (contextInLeft (i + 1) ctx) t1) g (reallyTermShape (contextInRight (i + 1) ctx) t2)
    in
        if 0 < ctx.precedence then
            parens ctx s
        else
            s


parens : Context -> Shape -> Shape
parens ctx shape =
    { width = 400 + shape.width + 400
    , above = 250 + 750
    , below = (-250) + 750
    , svg =
        \tr ->
            ((leftParenShape ctx).svg tr
                ++ shape.svg { tr | x = tr.x + 400 }
                ++ (rightParenShape ctx).svg { tr | x = (tr.x + 400 + shape.width) }
            )
    , focus = translateRectX 400 shape.focus
    , assoc = translateRectX 400 shape.assoc
    , mathML = ifInnerFocus ctx [ MathML.mo [] [ H.text "(" ] ] ++ shape.mathML ++ ifInnerFocus ctx [ MathML.mo [] [ H.text ")" ] ]
    }


leftParenShape : Context -> Shape
leftParenShape ctx =
    raiseShape
        { width = 400
        , above = 250.0 + 750.0
        , below = (-250) + 750.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextParenColor ctx)
                    , SA.strokeWidth (toString 40)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.d
                        (("M" ++ toS (tr.x + 330) ++ " " ++ toS (tr.y + 270 - 750))
                            ++ ("A"
                                    ++ toS (1500 - 250)
                                    ++ " "
                                    ++ toS (1500 - 250)
                                    ++ " "
                                    ++ toS (0)
                                    ++ " "
                                    ++ toS (0)
                                    ++ " "
                                    ++ toS (0)
                                    ++ " "
                                    ++ toS (tr.x + 330)
                                    ++ " "
                                    ++ toS (tr.y + 230 + 750)
                               )
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = []
        }


rightParenShape : Context -> Shape
rightParenShape ctx =
    raiseShape
        { width = 400
        , above = 250.0 + 750.0
        , below = (-250) + 750.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextParenColor ctx)
                    , SA.strokeWidth (toString 40)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.d
                        (("M" ++ toS (tr.x + 70) ++ " " ++ toS (tr.y + 270 - 750.0))
                            ++ ("A"
                                    ++ toS (1500 - 250)
                                    ++ " "
                                    ++ toS (1500 - 250)
                                    ++ " "
                                    ++ toS (0)
                                    ++ " "
                                    ++ toS (0)
                                    ++ " "
                                    ++ toS (1)
                                    ++ " "
                                    ++ toS (tr.x + 70)
                                    ++ " "
                                    ++ toS (tr.y + 230 + 750)
                               )
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = []
        }


reallyUnaryShape : Shape -> Shape -> Shape
reallyUnaryShape gly s =
    { width = gly.width + 100 + s.width
    , above = max gly.above s.above
    , below = max gly.below s.below
    , svg =
        \tr ->
            gly.svg { tr | x = tr.x }
                ++ s.svg { tr | x = tr.x + gly.width + 100 }
    , focus = translateRectX (gly.width + 100 + s.width) s.focus
    , assoc = translateRectX (gly.width + 100 + s.width) s.assoc
    , mathML = gly.mathML ++ s.mathML
    }


reallyBinaryShape : Shape -> Shape -> Shape -> Shape
reallyBinaryShape s1 gly s2 =
    { width = s1.width + 400 + gly.width + 400 + s2.width
    , above = max3 s1.above gly.above s2.above
    , below = max3 s1.below gly.below s2.below
    , svg =
        \tr ->
            (s1.svg tr
                ++ gly.svg { tr | x = tr.x + s1.width + 400 }
                ++ s2.svg { tr | x = tr.x + s1.width + 400 + gly.width + 400 }
            )
    , focus = maybes s1.focus (translateRectX (s1.width + 400 + gly.width + 400) s2.focus)
    , assoc = maybes s1.assoc (translateRectX (s1.width + 400 + gly.width + 400) s2.assoc)
    , mathML = s1.mathML ++ gly.mathML ++ s2.mathML
    }


notShape : Context -> Shape
notShape ctx =
    raiseShape
        { width = 775
        , above = 370.0
        , below = (-130.0)
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeWidth (toString 40)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.d
                        (("M" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 700) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 700) ++ " " ++ toS (tr.y + 50))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = [ MathML.mi [] [ H.text "¬" ] ]
        }


starDiv : Html msg
starDiv =
    glyphShape metaColor (MathML.mo [] [ H.text "⋆" ]) starGlyph |> centerDiv


glyphShape : String -> Html Never -> Glyph -> Shape
glyphShape =
    reallyGlyphShape 0 0


reallyGlyphShape : Float -> Float -> String -> Html Never -> Glyph -> Shape
reallyGlyphShape xOffset yOffset color m glyph =
    { width = glyph.width
    , above = glyph.ascent
    , below = glyph.descent
    , svg = \tr -> [ S.use [ (SA.xlinkHref glyph.id), SA.x (toS (tr.x + xOffset)), SA.y (toS (tr.y + yOffset)), SA.fill color ] [] ]
    , focus = Nothing
    , assoc = Nothing
    , mathML = [ m ]
    }


downTackShape : Context -> Shape
downTackShape ctx =
    raiseShape
        { width = 790.0
        , above = 590.0
        , below = 100.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeWidth (toS 40)
                    , SA.strokeLinecap "round"
                    , SA.d
                        (("M" ++ toS (tr.x + 60) ++ " " ++ toS (tr.y + 570))
                            ++ ("L" ++ toS (tr.x + 720) ++ " " ++ toS (tr.y + 570))
                            ++ ("M" ++ toS (tr.x + 390) ++ " " ++ toS (tr.y - 80))
                            ++ ("L" ++ toS (tr.x + 390) ++ " " ++ toS (tr.y + 560))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = [ MathML.mi [] [ H.text "⊤" ] ]
        }


upTackShape : Context -> Shape
upTackShape ctx =
    raiseShape
        { width = 790.0
        , above = 600.0
        , below = 90.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeLinecap "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        (("M" ++ toS (tr.x + 60) ++ " " ++ toS (tr.y - 70))
                            ++ ("L" ++ toS (tr.x + 720) ++ " " ++ toS (tr.y - 70))
                            ++ ("M" ++ toS (tr.x + 390) ++ " " ++ toS (tr.y - 60))
                            ++ ("L" ++ toS (tr.x + 390) ++ " " ++ toS (tr.y + 580))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = [ MathML.mi [] [ H.text "⊥" ] ]
        }


rightArrowShape : Context -> Shape
rightArrowShape ctx =
    raiseShape
        { width = 1159.0
        , above = 511.0
        , below = 11.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeWidth (toString 40)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.d
                        (("M" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 1083) ++ " " ++ toS (tr.y + 250))
                            ++ ("M" ++ toS (tr.x + 873) ++ " " ++ toS (tr.y + 40))
                            ++ ("L" ++ toS (tr.x + 1083) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 873) ++ " " ++ toS (tr.y + 460))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = ifFocus ctx [ MathML.mo [] [ H.text "→" ] ]
        }


disjunctionShape : Context -> Shape
disjunctionShape ctx =
    raiseShape
        { width = 660.0
        , above = 550.0
        , below = 50.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        (("M" ++ toS (tr.x + 20) ++ " " ++ toS (tr.y + 530))
                            ++ ("L" ++ toS (tr.x + 330) ++ " " ++ toS (tr.y - 30))
                            ++ ("L" ++ toS (tr.x + 640) ++ " " ++ toS (tr.y + 530))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = ifFocus ctx [ MathML.mo [] [ H.text "∨" ] ]
        }


conjunctionShape : Context -> Shape
conjunctionShape ctx =
    raiseShape
        { width = 660.0
        , above = 550.0
        , below = 50.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        (("M" ++ toS (tr.x + 20) ++ " " ++ toS (tr.y - 30))
                            ++ ("L" ++ toS (tr.x + 330) ++ " " ++ toS (tr.y + 530))
                            ++ ("L" ++ toS (tr.x + 640) ++ " " ++ toS (tr.y - 30))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = ifFocus ctx [ MathML.mo [] [ H.text "∧" ] ]
        }


turnstileShape : Shape
turnstileShape =
    raiseShape
        { width = 600.0
        , above = 550.0
        , below = 50.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke "White"
                    , SA.strokeLinecap "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        ("M"
                            ++ toS (tr.x + 70)
                            ++ " "
                            ++ toS (tr.y - 30)
                            ++ "L"
                            ++ toS (tr.x + 70)
                            ++ " "
                            ++ toS (tr.y + 530)
                            ++ "M"
                            ++ toS (tr.x + 70)
                            ++ " "
                            ++ toS (tr.y + 250)
                            ++ "L"
                            ++ toS (tr.x + 530)
                            ++ " "
                            ++ toS (tr.y + 250)
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = [ MathML.mo [] [ H.text "⊢" ] ]
        }


leftRightArrowShape : Context -> Shape
leftRightArrowShape ctx =
    raiseShape
        { width = 987.0
        , above = 511.0
        , below = 11.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke (contextColor ctx)
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        (("M" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 911) ++ " " ++ toS (tr.y + 250))
                            ++ ("M" ++ toS (tr.x + 285) ++ " " ++ toS (tr.y + 40))
                            ++ ("L" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 285) ++ " " ++ toS (tr.y + 460))
                            ++ ("M" ++ toS (tr.x + 701) ++ " " ++ toS (tr.y + 40))
                            ++ ("L" ++ toS (tr.x + 911) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 701) ++ " " ++ toS (tr.y + 460))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = ifFocus ctx [ MathML.mo [] [ H.text "↔" ] ]
        }


longLeftRightArrowShape : Shape
longLeftRightArrowShape =
    raiseShape
        { width = 1859.0
        , above = 511.0
        , below = 11.0
        , svg =
            \tr ->
                [ S.path
                    [ SA.stroke "White"
                    , SA.strokeLinecap "round"
                    , SA.strokeLinejoin "round"
                    , SA.strokeWidth (toString 40)
                    , SA.d
                        (("M" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 1783) ++ " " ++ toS (tr.y + 250))
                            ++ ("M" ++ toS (tr.x + 285) ++ " " ++ toS (tr.y + 40))
                            ++ ("L" ++ toS (tr.x + 75) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 285) ++ " " ++ toS (tr.y + 460))
                            ++ ("M" ++ toS (tr.x + 1573) ++ " " ++ toS (tr.y + 40))
                            ++ ("L" ++ toS (tr.x + 1783) ++ " " ++ toS (tr.y + 250))
                            ++ ("L" ++ toS (tr.x + 1573) ++ " " ++ toS (tr.y + 460))
                        )
                    ]
                    []
                ]
        , focus = Nothing
        , assoc = Nothing
        , mathML = [ MathML.mo [] [ H.text "⟷" ] ]
        }



-- Utilities


max3 : Float -> Float -> Float -> Float
max3 f1 f2 f3 =
    max f1 (max f2 f3)


shapeHeight : Shape -> Float
shapeHeight s =
    s.below + s.above


toS : Float -> String
toS =
    round >> toString


toStr : Float -> String
toStr =
    rToStr 850


toStr2 : Float -> String
toStr2 =
    rToStr 950


rToStr : Float -> Float -> String
rToStr m n =
    let
        i =
            round ((abs n) * (1000 / m))

        r =
            i % 1000

        d =
            if n < 0 then
                "-"
            else
                ""

        e =
            if r == 0 then
                ""
            else if r < 10 then
                ".00" ++ toString r
            else if r < 100 then
                ".0" ++ toString r
            else
                "." ++ toString r
    in
        d ++ toString (i // 1000) ++ e


contextColor : Context -> String
contextColor c =
    case ( c.focusPosition, c.assocPosition ) of
        ( Path [], _ ) ->
            focusColor

        ( Inside, _ ) ->
            focusColor

        ( _, Path [] ) ->
            assocColor

        ( _, Inside ) ->
            assocColor

        ( _, _ ) ->
            nonFocusColor


contextParenColor : Context -> String
contextParenColor c =
    case ( c.focusPosition, c.assocPosition ) of
        ( Inside, _ ) ->
            focusColor

        ( _, Inside ) ->
            assocColor

        ( _, _ ) ->
            nonFocusColor


maybes : Maybe a -> Maybe a -> Maybe a
maybes m1 m2 =
    case m1 of
        Just x ->
            Just x

        Nothing ->
            m2


translateRectX : Float -> Maybe Rect -> Maybe Rect
translateRectX x =
    Maybe.map (\r -> { r | x = r.x + x })


translateRectY : Float -> Maybe Rect -> Maybe Rect
translateRectY y =
    Maybe.map (\r -> { r | y = r.y + y })


contextInLeft : Int -> Context -> Context
contextInLeft i c =
    let
        focusPosition =
            case c.focusPosition of
                Path [] ->
                    Inside

                Path (Path.GoLeft :: path2) ->
                    Path path2

                Path (Path.GoRight :: path2) ->
                    Outside

                Inside ->
                    Inside

                Outside ->
                    Outside

        assocPosition =
            case c.assocPosition of
                Path [] ->
                    Inside

                Path (Path.GoLeft :: path2) ->
                    Path path2

                Path (Path.GoRight :: path2) ->
                    Outside

                Inside ->
                    Inside

                Outside ->
                    Outside
    in
        { c | precedence = i, focusPosition = focusPosition, assocPosition = assocPosition }


contextInRight : Int -> Context -> Context
contextInRight i c =
    let
        focusPosition =
            case c.focusPosition of
                Path [] ->
                    Inside

                Path (Path.GoLeft :: path2) ->
                    Outside

                Path (Path.GoRight :: path2) ->
                    Path path2

                Inside ->
                    Inside

                Outside ->
                    Outside

        assocPosition =
            case c.assocPosition of
                Path [] ->
                    Inside

                Path (Path.GoLeft :: path2) ->
                    Outside

                Path (Path.GoRight :: path2) ->
                    Path path2

                Inside ->
                    Inside

                Outside ->
                    Outside
    in
        { c | precedence = i, focusPosition = focusPosition, assocPosition = assocPosition }


contextIsMathML : Context -> Bool
contextIsMathML c =
    case c.focusPosition of
        Path [] ->
            True

        Path _ ->
            True

        Inside ->
            True

        Outside ->
            False


contextIsFocus : Context -> Bool
contextIsFocus c =
    case c.focusPosition of
        Path [] ->
            True

        Path _ ->
            False

        Inside ->
            True

        Outside ->
            False


contextIsTrueFocus : Context -> Bool
contextIsTrueFocus c =
    case c.focusPosition of
        Path [] ->
            True

        Path _ ->
            False

        Inside ->
            False

        Outside ->
            False


contextIsTrueAssoc : Context -> Bool
contextIsTrueAssoc c =
    case c.assocPosition of
        Path [] ->
            True

        Path _ ->
            False

        Inside ->
            False

        Outside ->
            False


focusColor : String
focusColor =
    "White"


assocColor : String
assocColor =
    "Yellow"


nonFocusColor : String
nonFocusColor =
    "SlateGrey"


metaColor : String
metaColor =
    "Orchid"


translateGlyph : Float -> Float -> Glyph -> Glyph
translateGlyph x y g =
    { g | ascent = g.ascent + y, descent = g.descent - y, xStart = g.xStart + x, xEnd = g.xEnd + x }


commaGlyph : Glyph
commaGlyph =
    { id = "#MJMAIN-2C", ascent = 121, descent = 195, width = 278, xStart = 78, xEnd = 210 }


latinUpperAGlyph : Glyph
latinUpperAGlyph =
    translateGlyph (-40) (0) { id = "#MJMATHI-41", ascent = 716, descent = 0, width = 743, xStart = 58, xEnd = 696 }


latinUpperBGlyph : Glyph
latinUpperBGlyph =
    translateGlyph (-40) (0) { id = "#MJMATHI-42", ascent = 683, descent = 0, width = 704, xStart = 57, xEnd = 732 }


latinUpperCGlyph : Glyph
latinUpperCGlyph =
    translateGlyph (-40) (0) { id = "#MJMATHI-43", ascent = 705, descent = 21, width = 716, xStart = 150, xEnd = 812 }


starGlyph : Glyph
starGlyph =
    { id = "#MJAMS-2605", ascent = 694, descent = 111, width = 944, xStart = 49, xEnd = 895 }


frakturAGlyph : Glyph
frakturAGlyph =
    { id = "#MJFRAK-41", ascent = 696, descent = 26, width = 718, xStart = 22, xEnd = 707 }


frakturBGlyph : Glyph
frakturBGlyph =
    { id = "#MJFRAK-42", ascent = 691, descent = 27, width = 884, xStart = 48, xEnd = 820 }


frakturCGlyph : Glyph
frakturCGlyph =
    { id = "#MJFRAK-43", ascent = 685, descent = 24, width = 613, xStart = 59, xEnd = 607 }


frakturAHtml : Html msg
frakturAHtml =
    frakturAGlyph |> glyphShape metaColor (MathML.mi [ MathML.Attributes.mathvariant "fraktur" ] [ H.text "A" ]) |> shapeSpan


topHtml : Html msg
topHtml =
    downTackShape defaultContext |> shapeSpan


botHtml : Html msg
botHtml =
    upTackShape defaultContext |> shapeSpan


latinUpperAHtml : Html msg
latinUpperAHtml =
    latinUpperAGlyph |> reallyGlyphShape (-40) (0) focusColor (MathML.mi [] [ H.text "A" ]) |> shapeSpan


latinUpperBHtml : Html msg
latinUpperBHtml =
    latinUpperBGlyph |> reallyGlyphShape (-70) (0) focusColor (MathML.mi [] [ H.text "B" ]) |> shapeSpan


latinUpperCHtml : Html msg
latinUpperCHtml =
    latinUpperCGlyph |> reallyGlyphShape (-40) (0) focusColor (MathML.mi [] [ H.text "C" ]) |> shapeSpan


equivalenceHtml : Html msg
equivalenceHtml =
    leftRightArrowShape defaultContext |> shapeSpan


conjunctionHtml : Html msg
conjunctionHtml =
    conjunctionShape defaultContext |> shapeSpan


disjunctionHtml : Html msg
disjunctionHtml =
    disjunctionShape defaultContext |> shapeSpan


longLeftRightArrowHtml : Html msg
longLeftRightArrowHtml =
    longLeftRightArrowShape |> shapeSpan


turnstileHtml : Html msg
turnstileHtml =
    turnstileShape |> shapeSpan


shapeHtml : Shape -> Html msg
shapeHtml shape =
    castHtml <|
        S.svg
            [ SA.style <|
                ("transform: scale(1,-1);")
                    ++ ("width: " ++ toStr shape.width ++ "em" ++ ";")
                    ++ ("height: " ++ toStr (shape.below + shape.above) ++ "em" ++ ";")
                    ++ ("flex-shrink: 1;")
            , ariaHidden True
            , SA.fill "none"
            , SA.viewBox <| toS 0.0 ++ " " ++ toS (0.0 - shape.below) ++ " " ++ toS shape.width ++ " " ++ toS (shape.below + shape.above)
            ]
            (shape.svg { x = 0.0, y = 0.0 })


formulaView : Term -> Html msg
formulaView =
    midTermShape >> formulaShapeView


formulaHtml0 : Term -> Html msg
formulaHtml0 =
    lazy reallyFormulaHtml0


reallyFormulaHtml0 : Term -> Html msg
reallyFormulaHtml0 term =
    reallyFormulaHtml1 term []


formulaHtml1 : Term -> Path -> Html msg
formulaHtml1 =
    lazy2 reallyFormulaHtml1


reallyFormulaHtml1 : Term -> Path -> Html msg
reallyFormulaHtml1 term path =
    term
        |> reallyTermShape { precedence = 0, focusPosition = Path path, assocPosition = Outside }
        |> formulaShapeView


formulaHtml2 : Term -> Path -> Path -> Html msg
formulaHtml2 =
    lazy3 reallyFormulaHtml2


reallyFormulaHtml2 : Term -> Path -> Path -> Html msg
reallyFormulaHtml2 term path1 path2 =
    case path2 of
        [] ->
            term
                |> reallyTermShape { precedence = 0, focusPosition = Path path1, assocPosition = Outside }
                |> formulaShapeView

        _ ->
            term
                |> reallyTermShape { precedence = 0, focusPosition = Path path1, assocPosition = Path path2 }
                |> formulaShapeView


formulaShapeView : Shape -> Html msg
formulaShapeView shape =
    let
        rect =
            shapeRect shape

        centeredHeight =
            max (rect.above - midline) (rect.below + midline) * 2

        halfHeight =
            max 925 (max (rect.above - midline) (rect.below + midline))

        buffer =
            500

        svg =
            castHtml <|
                S.svg
                    [ SA.class "center-formula"
                    , SA.fill "none"
                    , SA.viewBox
                        (toS (rect.x - buffer)
                            ++ " "
                            ++ toS (rect.y - halfHeight + midline)
                            ++ " "
                            ++ toS (rect.width + 2 * buffer)
                            ++ " "
                            ++ toS (2 * halfHeight)
                        )
                    ]
                    (shape.svg { x = 0.0, y = 0.0 }
                     -- ++ [ S.rect
                     --         [ SA.stroke "black"
                     --         , SA.x <| toS rect.x
                     --         , SA.y <| toS rect.y
                     --         , SA.width <| toS rect.width
                     --         , SA.height <| toS (rect.below + rect.above)
                     --         ]
                     --         []
                     --    ]
                    )
    in
        H.div [ HA.class "formula-svg-box" ]
            [ svg
            , H.span [ HA.style [ ( "display", "block" ), ( "overflow", "hidden" ), ( "height", "1px" ), ( "width", "1px" ) ] ]
                [ castHtml (MathML.math [] (shape.mathML)) ]
            ]


shapeRect : Shape -> Rect
shapeRect shape =
    case ( shape.focus, shape.assoc ) of
        ( Nothing, Nothing ) ->
            { x = 0.0, y = 0.0, width = shape.width, above = shape.above, below = shape.below }

        ( Just r, Nothing ) ->
            r

        ( Nothing, Just r ) ->
            r

        ( Just r1, Just r2 ) ->
            let
                centerX =
                    r1.x + r1.width / 2

                halfWidth =
                    max (max (r1.x + r1.width - centerX) (r2.x + r2.width - centerX))
                        (max (centerX - r1.x) (centerX - r2.x))
            in
                { x = centerX - halfWidth
                , y = r1.y
                , width = halfWidth * 2
                , above = max r1.above (r2.above + r2.y - r1.y)
                , below = max r2.below (r2.below + r1.y - r2.y)
                }


termSpan : Term -> Html a
termSpan =
    lazy (termShape >> shapeSpan)


ruleSpan : Rule -> Html a
ruleSpan =
    lazy (ruleShape >> shapeSpan)


leftTermDiv : Term -> Html msg
leftTermDiv =
    lazy (midTermShape >> expandShape >> leftDiv)


centerTermDiv : Term -> Html msg
centerTermDiv =
    lazy (midTermShape >> expandShape >> centerDiv)


yellowLeftTermDiv : Term -> Html msg
yellowLeftTermDiv =
    lazy (yellowTermShape >> expandShape >> leftDiv)


yellowTermShape : Term -> Shape
yellowTermShape term =
    let
        shape =
            reallyTermShape { precedence = 0, focusPosition = Outside, assocPosition = Inside } term
    in
        { shape | above = midline + 750, below = 750 - midline }


shapeSpan : Shape -> Html a
shapeSpan shape =
    castHtml <|
        H.span [ HA.style [ ( "display", "inline-block" ), ( "position", "relative" ), ( "width", toStr2 shape.width ++ "em" ) ] ]
            [ S.svg
                [ SA.style <|
                    "transform: scale(1,-1);"
                        ++ ("width: " ++ toStr2 (shape.width + expansion * 2) ++ "em" ++ ";")
                        ++ ("height: " ++ toStr2 (shape.below + shape.above + expansion * 2) ++ "em" ++ ";")
                        ++ "position: absolute;"
                        ++ ("bottom: " ++ toStr2 (0.0 - (shape.below + expansion)) ++ "em;")
                        ++ ("left: " ++ toStr2 (0.0 - expansion) ++ "em;")
                , ariaHidden True
                , SA.fill "none"
                , SA.viewBox <|
                    (toS 0.0 ++ " ")
                        ++ (toS (0.0 - (shape.below + expansion)) ++ " ")
                        ++ (toS (shape.width + expansion * 2) ++ " ")
                        ++ toS (shape.below + shape.above + expansion * 2)
                ]
                (shape.svg { x = expansion, y = 0.0 })
            , H.span [ HA.style [ ( "display", "block" ), ( "overflow", "hidden" ), ( "height", "1px" ), ( "width", "1px" ) ] ] [ MathML.math [] (shape.mathML) ]
            ]


midline : Float
midline =
    250 + raiseY


raiseY : Float
raiseY =
    90


raiseShape : Shape -> Shape
raiseShape =
    reallyRaiseShape raiseY


reallyRaiseShape : Float -> Shape -> Shape
reallyRaiseShape y s =
    { s
        | above = s.above + y
        , below = s.below - y
        , svg = \t -> s.svg { t | y = t.y + y }
        , focus = translateRectY y s.focus
        , assoc = translateRectY y s.assoc
    }


ifFocus : Context -> List (Html msg) -> List (Html msg)
ifFocus ctx m =
    if contextIsFocus ctx then
        m
    else
        []


ifInnerFocus : Context -> List (Html msg) -> List (Html msg)
ifInnerFocus ctx m =
    if ctx.focusPosition == Inside then
        m
    else
        []
