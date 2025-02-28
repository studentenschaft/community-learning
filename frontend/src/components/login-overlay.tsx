import { Button, Flex, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { msalInstance } from "../auth/msalConfig"; // Adjust the import path as needed
import { InteractionStatus } from "@azure/msal-browser";

const LoginOverlay: React.FC<{}> = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interactionInProgress, setInteractionInProgress] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("MSAL initialization failed:", error);
      }
    };

    initializeMsal();

    const handleInteractionStatusChange = (status: InteractionStatus) => {
      console.log(`Interaction status changed: ${status}`);
      setInteractionInProgress(status !== InteractionStatus.None);
    };

    msalInstance.addEventCallback((event) => {
      if (event.eventType === "msal:loginStart" || event.eventType === "msal:acquireTokenStart") {
        handleInteractionStatusChange(InteractionStatus.Login);
      } else if (event.eventType === "msal:loginSuccess" || event.eventType === "msal:loginFailure" || event.eventType === "msal:acquireTokenSuccess" || event.eventType === "msal:acquireTokenFailure") {
        handleInteractionStatusChange(InteractionStatus.None);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!isInitialized) {
      console.error("MSAL is not initialized");
      return;
    }

    if (interactionInProgress) {
      console.error("Interaction is currently in progress");
      return;
    }

    try {
      console.log("Starting login redirect...");
      await msalInstance.loginRedirect();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        textAlign: "center",
      }}
    >
      <div>
        <Text size="1.75rem" fw={700} mb="md" c="white">
          Please Sign in
        </Text>
        <Button
          size="lg"
          variant="outline"
          onClick={handleLogin}
          disabled={!isInitialized || interactionInProgress}
        >
          Login with Microsoft
        </Button>
      </div>
    </Flex>
  );
};

export default LoginOverlay;
