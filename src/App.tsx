import React, { useState, useEffect } from "react";
import "./App.css";
import flowcode_blue from "./images/flowcode-blue.png";
import flowcode_green from "./images/flowcode-green.png";
import "./styles.scss";
import Carousel from "react-bootstrap/Carousel";

const API =
  "https://eaststgmc.blob.core.windows.net/frontend-homework/MOCK_API_DATA.json";

// Interface used to format data into Permutation object
interface Permutation {
  brand?: string[];
  campaign?: string;
  id?: string;
  last_modified?: string;
  name?: string;
  time_stamp?: string;
  variables?: string[];
}

const App: React.FC = () => {
  const [permutations, setPermutations] = useState<Permutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parses JSON into object
  function formatPermutation(permutation: any): Permutation {
    return {
      brand: permutation.brand,
      campaign: permutation.campaign,
      id: permutation.id,
      last_modified: permutation.last_modified,
      name: permutation.name,
      time_stamp: permutation.time_stamp,
      variables: permutation.variables,
    };
  }
  // Hook is called when component is mounted
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((res) =>
        res.map((permutation: any) => formatPermutation(permutation))
      )
      .then((res) => {
        // Once data is received, loading is false
        setPermutations(res);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="App">
      {isLoading && <p className="loading">Loading Permutation Wizard...</p>}
      {!isLoading && <PermutationScroller permutations={permutations} />}
    </div>
  );
};

// Interfaces for declaring type of state variables
interface PermutationScrollerProps {
  permutations: Permutation[];
}

interface ChosenObj {
  [id: string]: boolean;
}

const PermutationScroller = ({ permutations }: PermutationScrollerProps) => {
  // Chosen holds 'ids' of the selected permutations
  const [chosen, setChosen] = useState<ChosenObj>({});

  // Manages what user interface should show based on whether selection is completed or not
  const [completed, setCompleted] = useState(false);

  // Holds the permutations that correspond to the selected permutations from 'chosen'
  const [chosenPermutations, setChosenPermutations] = useState<Permutation[]>(
    []
  );

  // Function to handle selecting permutations. Receives "click" data from child component
  const handleChoice = (id: string, value: boolean) => {
    if (value) {
      // If value is true, item is selected. Add to chosen object with true value
      setChosen({ ...chosen, [id]: value });
    } else {
      // If value is false, item is deselected. Remove from chosen object
      delete chosen[id];
    }
  };

  // Handles submitting permutation selections
  const onSubmit = () => {
    if (Object.keys(chosen).length < 1) {
      // Don't allow user to select 0 permutations
      setCompleted(false);
      alert("Please select at least one permutation!");
      return;
    }
    var selected_permutations: Permutation[] = [];
    if (!completed) {
      // Iterates through chosen id's and matches to permutations. Would be faster with a dictionary of id's that map to permutations
      Object.keys(chosen).forEach((id) => {
        permutations.forEach((permutation) => {
          if (permutation.id === id) {
            selected_permutations.push(permutation);
          }
        });
      });
    }
    setChosenPermutations(selected_permutations);
    setCompleted(true);
  };

  // Handles user choosing to "reselect" permutations
  const onBack = () => {
    setChosen({});
    var selected_permutations: Permutation[] = [];
    setChosenPermutations(selected_permutations);
    setCompleted(false);
  };

  return (
    <div>
      {/* View that is rendered when user is in selection phase */}
      {!completed && (
        <div>
          <div className="header">
            <h1 className="permutation-wizard">Choose Permutations</h1>
            <h5>To choose a permutation, click on the QR code.</h5>
          </div>
          <div className="main-content">
            <div className="carousel-container">
              <Carousel controls interval={null}>
                {permutations.map((permutation) => (
                  <Carousel.Item key={permutation.id}>
                    <PermutationView
                      id={permutation.id}
                      variables={permutation.variables}
                      brand={permutation.brand}
                      onSelection={handleChoice}
                      shouldSelect={true}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </div>
          <button className="done-button" onClick={onSubmit}>
            Done
          </button>
        </div>
      )}
      {/* View that is rendered when user is viewing selections */}
      {completed && (
        <div>
          <div className="header">
            <h1 className="permutation-wizard">Selected Permutations</h1>
            <h5>These are the permutations you chose to test.</h5>
          </div>
          <div className="main-content">
            <div className="carousel-container">
              <Carousel controls interval={null}>
                {chosenPermutations.map((permutation) => (
                  <Carousel.Item key={permutation.id}>
                    <PermutationView
                      id={permutation.id}
                      variables={permutation.variables}
                      brand={permutation.brand}
                      onSelection={handleChoice}
                      shouldSelect={false}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </div>
          <button className="back-button" onClick={onBack}>
            Reselect
          </button>
        </div>
      )}
    </div>
  );
};

// Interface used for strongly typing props
interface PermutationProps {
  id?: string;
  variables?: string[];
  brand?: string[];
  onSelection: (id: string, value: boolean) => void;
  shouldSelect: boolean;
}

const PermutationView = ({
  id,
  variables,
  brand,
  onSelection,
  shouldSelect,
}: PermutationProps) => {
  const [selected, setSelected] = useState(false);
  // Ensure that brand and variables aren't missing; if they are, show nothing and alert user
  if (!brand || !variables) {
    alert("Brand and/or Variables fields are missing.");
    return <div></div>;
  }
  // Set color and callToAction variables
  const color = variables[0];
  const callToAction = variables[1];

  // Default flowcode is blue; if color is green, change the image to green flowcode
  var flowcode = flowcode_blue;
  if (color === "Green") {
    flowcode = flowcode_green;
  }

  // Handles selection of permutation
  const onSelect = () => {
    setSelected(!selected);
    // Update parent component object
    onSelection(id!, !selected);
  };

  return (
    <div className="permutation">
      <h5 className="permutation-text brand">Brand Name: {brand[0]}</h5>
      {shouldSelect && selected && (
        <div className="permutation-container selected">
          <img
            className="flowcode"
            src={flowcode}
            alt="flowcode-img"
            onClick={onSelect}
          />
          <h3 className="permutation-text call-to-action">{callToAction}</h3>
        </div>
      )}
      {shouldSelect && !selected && (
        <div className="permutation-container">
          <img
            className="flowcode"
            src={flowcode}
            alt="flowcode-img"
            onClick={onSelect}
          />
          <h3 className="permutation-text call-to-action">{callToAction}</h3>
        </div>
      )}
      {!shouldSelect && (
        <div className="permutation-container">
          <img className="flowcode" src={flowcode} alt="flowcode-img" />
          <h3 className="permutation-text call-to-action">{callToAction}</h3>
        </div>
      )}
    </div>
  );
};

export default App;
