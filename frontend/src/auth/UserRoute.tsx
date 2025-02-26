import { Route, RouteProps } from "react-router-dom";
import { useUser } from ".";
import LoadingOverlay from "../components/loading-overlay";
import LoginOverlay from "../pages/login-page";
import React from "react";

const UserRouteContent = <T extends RouteProps>({
  props,
  loginProps,
}: {
  props: T;
  loginProps: Parameters<typeof LoginOverlay>[0];
}) => {
  const user = useUser();
  if (props.path === "/") {
    return (
      <>
        <LoadingOverlay visible={user === undefined} />
        <Route {...props} />
      </>
    );
  } else if (user !== undefined && !user.loggedin) {
    return <LoginOverlay {...loginProps} />;
  } else {
    return (
      <>
        <LoadingOverlay visible={user === undefined} />
        {user !== undefined && <Route {...props} />}
      </>
    );
  }
};

const UserRoute = <T extends RouteProps>(props: T) => {
  return (
    <Route exact={props.exact} path={props.path}>
      <UserRouteContent
        props={props}
        loginProps={{ isHome: props.path === "/" }}
      />
    </Route>
  );
};

export default UserRoute;
