import { ChakraProvider } from "@chakra-ui/react";
import React from "react";

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <div>
        <p>Hello world!</p>
      </div>
    </ChakraProvider>
  );
};

export default App;
