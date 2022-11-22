import "./App.scss";
import React, { useState, useEffect } from "react";
import axios from "axios";

const germanNounsUrl =
  "https://edwardtanguay.vercel.app/share/germanNouns.json";
const localStorageVariableName = "nouns-game-state";

interface INoun {
  article: string;
  singular: string;
  plural: string;
  isOpen: boolean;
  isLearned: boolean;
}

function App() {
  const [germanNouns, setGermanNouns] = useState<INoun[]>([]);
  useEffect(() => {
    (async () => {
      let _germanNouns: INoun[] = [];

      const localStorageNouns = localStorage.getItem(localStorageVariableName);

      //console.log(localStorageNouns); == null =>
      if (localStorageNouns !== null) {
        _germanNouns = JSON.parse(localStorageNouns);
      } else {
        // get from API
        const rawGermanNouns = (await axios.get(germanNounsUrl)).data;

        _germanNouns = [];
        rawGermanNouns.forEach((rawGermanNoun: any) => {
          const _germanNoun: INoun = {
            ...rawGermanNoun,
            isOpen: false,
            isLearned: false,
          };
          _germanNouns.push(_germanNoun);
        });
      }

      setGermanNouns(_germanNouns);
    })();
  }, []);

  // statt localstorage zweimal schreiben => refakturing

  const saveApplicationState = () => {
    localStorage.setItem(localStorageVariableName, JSON.stringify(germanNouns));
    setGermanNouns([...germanNouns]);
  };

  const handleToggleFlashCard = (germanNoun: INoun) => {
    germanNoun.isOpen = !germanNoun.isOpen;

    saveApplicationState();
  };
  const handleMarkAsLearned = (germanNoun: INoun) => {
    germanNoun.isLearned = true;

    saveApplicationState();
  };

  const getNumberLearned = () => {
    return germanNouns.reduce((acc, cur) => acc + (cur.isLearned ? 1 : 0), 0);
  };
  const handleResetBtn = () => {
    localStorage.removeItem(localStorageVariableName);
    window.location.reload();
  };
  return (
    <div className="App">
      <h1>German Nouns ({getNumberLearned()} learned so far)</h1>
      <div className="info">
        <p>
          You have learned {getNumberLearned()} of {germanNouns.length} nouns.{" "}
        </p>
        <div className="learned">
          <div>Remaining: {germanNouns.length - getNumberLearned()}</div>
          <button onClick={() => handleResetBtn()}>Reset</button>
        </div>
      </div>
      <div className="germanNouns">
        {germanNouns.map((germanNoun) => {
          return (
            <React.Fragment key={germanNoun.singular}>
              {!germanNoun.isLearned && (
                <div className="germanNoun">
                  <div
                    className="front"
                    onClick={() => handleToggleFlashCard(germanNoun)}
                  >
                    {" "}
                    {germanNoun.singular}
                  </div>
                  {germanNoun.isOpen && (
                    <div className="back">
                      <div className="singular">
                        {germanNoun.article} {germanNoun.singular}
                      </div>
                      <div className="plural">{germanNoun.plural}</div>
                      <button onClick={() => handleMarkAsLearned(germanNoun)}>
                        Mark as learned
                      </button>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default App;
