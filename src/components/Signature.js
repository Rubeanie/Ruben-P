'use client';

import { useEffect, useRef } from 'react';

const str =
  '-\n\
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
-';

export default function Signature() {
  const ref = useRef(null);
  const commentAdded = useRef(false);

  useEffect(() => {
    if (ref.current && !commentAdded.current) {
      const comment = document.createComment(str);
      ref.current.parentNode.insertBefore(comment, ref.current);
      commentAdded.current = true;
    }
  }, []);

  return <div ref={ref}></div>;
}
