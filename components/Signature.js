import HTMLComment from "react-html-comment";

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

const Signature = () => {
  return <HTMLComment text={str} />;
};

export default Signature;
