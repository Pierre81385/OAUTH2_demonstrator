import { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";

export default function Auth() {
  const [client_id, setClientId] = useState("");
  const [secret, setSecret] = useState("");
  const [redirect_uri, setRedirectURI] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [gotAuth, setGotAuth] = useState(false);

  useEffect(() => {
    setClientId("BN5I81XZTDNWALCJDDMLJ5MOL50ZGCKS");
    setSecret(
      "O6ELNOPES1I547TTMRUOWDOZ4VUW38MQ0NRZ6RNQEUWNU3DEJDQCO5DR6F6L9F86"
    );
    setRedirectURI("http://localhost:3000/auth");
  });

  const getAuthToken = async () => {
    const query = new URLSearchParams({
      client_id: client_id,
      client_secret: secret,
      code: accessCode,
    }).toString();

    await axios
      .post(`https://api.clickup.com/api/v2/oauth/token?${query}`, {
        responseType: "json",
      })
      .then((resp) => {
        setAccessToken(resp.data.access_token);
        setGotAuth(true);
      })
      .catch((error) => {
        setError(error);
        console.log(error);
      });
  };

  const getTeams = async () => {
    await axios
      .get(
        `https://api.clickup.com/api/v2/team`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        {
          responseType: "json",
        }
      )
      .then((resp) => {
        setResponse(resp.data);
      })
      .catch((error) => {
        setError(error);
        console.log(error);
      });
  };

  return (
    <div>
      <h1>OAUTH FLOW</h1>
      <ul>
        <li>
          STEP 1: In ClickUp, 'Create an App' to get the 'client_id' and
          'secret', and redirect url aka where the user gets sent when this
          process is successful.
        </li>
        {client_id == "" || secret == "" || redirect_uri == "" ? (
          <></>
        ) : (
          <li>
            <p>
              STEP 2: Fill in the variables of this URL
              https://app.clickup.com/api?client_id=[client_id]&redirect_uri=
              [redirect_uri]
            </p>
            <p>
              Users are sent to this URL by custom apps to login to their
              ClickUp account and select Workspaces to connect.
            </p>
            <Button
              variant="dark"
              onClick={() => {
                window.location.href = `https://app.clickup.com/api?client_id=${client_id}&redirect_uri=${redirect_uri}`;
              }}>
              Connect to ClickUp
            </Button>
          </li>
        )}

        <li>
          <p>
            STEP 3: Get the Authorization Code. This code is added to the
            redirect url and can be used to authorize the GET ACCESS TOKEN API
            request.
          </p>
          <p>
            After connecting with ClickUp see that the code is part of the URL.
          </p>
          <Button
            variant="dark"
            onClick={() => {
              var url = window.location.search;
              setAccessCode(url.replace("?code=", ""));
            }}>
            SAVE AUTHORIZATION CODE
          </Button>
          <p>Authorization code: {accessCode}</p>
        </li>

        {accessCode == "" ? (
          <></>
        ) : (
          <li>
            <p>
              STEP 4: Using the code sent with the redirect URL, send the GET
              ACCESS TOKEN request.
            </p>
            <Button
              variant="dark"
              onClick={() => {
                getAuthToken();
              }}>
              GET ACCESS TOKEN
            </Button>
            <p>Access token: "Bearer {accessToken}"</p>
          </li>
        )}
        {!gotAuth ? (
          <></>
        ) : (
          <li>
            <p>STEP 5: Verify with a basic GET REQUEST!</p>
            <p>GET AUTHORIZED TEAMS (Workspaces)</p>
            <Button
              variant="dark"
              onClick={() => {
                getTeams();
              }}>
              GET AUTHORIZED TEAMS
            </Button>
            {error != null ? <p>{error}</p> : <p>{JSON.stringify(response)}</p>}
          </li>
        )}
      </ul>
    </div>
  );
}
