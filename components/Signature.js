import HTMLComment from "react-html-comment";
import React from "react";

const str =
  "-\n\
                                                                      \n\
                      :                             ..                \n\
:     .:                     :.        -            ..           .:   \n\
                :.               ..                                   \n\
                                          .            :.             \n\
     -               -        -          ..     .##                 :.\n\
           -                                   :#:-#.+*+      .       \n\
               =%           :.          :     :#   :+- -#.    :       \n\
:.           -*:#.       :                    *-     -. .*+.          \n\
           :*=  :*=.             .:         =*-       .-  :*+:        \n\
      -  :*=      .==++=.                .+*:            =. .+*.      \n\
     *+*+=.            .*+-.          +++=.                .  :++:    \n\
   -#- =                  :++:  :-+++::                    :+     -.::\n\
.:-:  -                     .-*%#=------::.                    -=     \n\
.  -:                            .:::..:::-+++==-: .               .: \n\
                                               .:..: -:               \n\
-";

class Signature extends React.Component {
  render() {
    return <HTMLComment text={str} />
  }
}

export default Signature;
