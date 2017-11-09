module Rules exposing (..)

import Term exposing (..)
import Rule exposing (Rule)


implosionRule : Rule
implosionRule =
    { name = "Implosion"
    , isSymmetric = False
    , antecedents = [ (Atom (MetaVar MetaA)) ]
    , left = (Atom (MetaVar MetaA))
    , right = (Atom Top)
    }


explosionRule : Rule
explosionRule =
    { name = "Explosion"
    , isSymmetric = False
    , antecedents = [ (Atom Bot) ]
    , left = (Atom Top)
    , right = (Atom (MetaVar MetaA))
    }


identityForConjunctionRule : Rule
identityForConjunctionRule =
    { name = "Identity for conjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Conjunction (Atom (MetaVar MetaA)) (Atom Top)
    , right = (Atom (MetaVar MetaA))
    }


identityForDisjunctionRule : Rule
identityForDisjunctionRule =
    { name = "Identity for disjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Disjunction (Atom (MetaVar MetaA)) (Atom Bot)
    , right = (Atom (MetaVar MetaA))
    }


identityForEquivalenceRule : Rule
identityForEquivalenceRule =
    { name = "Identity for equivalence"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Equivalence (Atom (MetaVar MetaA)) (Atom Top)
    , right = (Atom (MetaVar MetaA))
    }


distributionOfConjunctionOverDisjunction : Rule
distributionOfConjunctionOverDisjunction =
    { name = "Distribution of conjunction over disjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Conjunction (Atom (MetaVar MetaA)) (Binary Disjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaC)))
    , right = Binary Disjunction (Binary Conjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))) (Binary Conjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaC)))
    }


distributionOfDisjunctionOverConjunction : Rule
distributionOfDisjunctionOverConjunction =
    { name = "Distribution of disjunction over conjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Disjunction (Atom (MetaVar MetaA)) (Binary Conjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaC)))
    , right = Binary Conjunction (Binary Disjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))) (Binary Disjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaC)))
    }


annihilationForConjunctionRule : Rule
annihilationForConjunctionRule =
    { name = "Annihilation for conjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Conjunction (Atom Bot) (Atom (MetaVar MetaA))
    , right = (Atom Bot)
    }


annihilationForDisjunctionRule : Rule
annihilationForDisjunctionRule =
    { name = "Annihilation for disjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Disjunction (Atom Top) (Atom (MetaVar MetaA))
    , right = (Atom Top)
    }


annihilationForEquivalenceRule : Rule
annihilationForEquivalenceRule =
    { name = "Annihilation for equivalence (bad)"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Equivalence (Atom Bot) (Atom (MetaVar MetaA))
    , right = (Atom Bot)
    }


commutativityForConjunctionRule : Rule
commutativityForConjunctionRule =
    { name = "Commutativity for conjunction"
    , isSymmetric = True
    , antecedents = []
    , left = Binary Conjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))
    , right = Binary Conjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaA))
    }


commutativityForDisjunctionRule : Rule
commutativityForDisjunctionRule =
    { name = "Commutativity for disjunction"
    , isSymmetric = True
    , antecedents = []
    , left = Binary Disjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))
    , right = Binary Disjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaA))
    }


symmetryForEquivalenceRule : Rule
symmetryForEquivalenceRule =
    { name = "Symmetry for equivalence"
    , isSymmetric = True
    , antecedents = []
    , left = Binary Equivalence (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))
    , right = Binary Equivalence (Atom (MetaVar MetaB)) (Atom (MetaVar MetaA))
    }


associativityForConjunctionRule : Rule
associativityForConjunctionRule =
    { name = "Associativity for conjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Conjunction (Atom (MetaVar MetaA)) (Binary Conjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaC)))
    , right = Binary Conjunction (Binary Conjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))) (Atom (MetaVar MetaC))
    }


associativityForDisjunctionRule : Rule
associativityForDisjunctionRule =
    { name = "Associativity for disjunction"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Disjunction (Atom (MetaVar MetaA)) (Binary Disjunction (Atom (MetaVar MetaB)) (Atom (MetaVar MetaC)))
    , right = Binary Disjunction (Binary Disjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))) (Atom (MetaVar MetaC))
    }


substitutionRule : Rule
substitutionRule =
    { name = "Substitution"
    , isSymmetric = False
    , antecedents = [ Binary Equivalence (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB)) ]
    , left = (Atom (MetaVar MetaA))
    , right = (Atom (MetaVar MetaB))
    }


reflexivityForEquivalenceRule : Rule
reflexivityForEquivalenceRule =
    { name = "Reflexivity"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Equivalence (Atom (MetaVar MetaA)) (Atom (MetaVar MetaA))
    , right = (Atom Top)
    }


negationFromEquivalenceRule : Rule
negationFromEquivalenceRule =
    { name = "Negation in terms of equivalence"
    , isSymmetric = False
    , antecedents = []
    , left = Unary Not (Atom (MetaVar MetaA))
    , right = Binary Equivalence (Atom (MetaVar MetaA)) (Atom Bot)
    }


implicationFromEquivalenceRule : Rule
implicationFromEquivalenceRule =
    { name = "Implication in terms of equivalence"
    , isSymmetric = False
    , antecedents = []
    , left = Binary Implication (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB))
    , right = Binary Equivalence (Atom (MetaVar MetaA)) (Binary Conjunction (Atom (MetaVar MetaA)) (Atom (MetaVar MetaB)))
    }
