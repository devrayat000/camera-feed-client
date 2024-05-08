import { Form } from "react-router-dom";

export default function HomeScreen() {
  return (
    <div>
      <Form action="./feed" method="GET">
        <input type="text" name="ip" placeholder="IP" />
        <input type="text" name="port" placeholder="Port" />
        <button type="submit">Connect</button>
      </Form>
    </div>
  );
}
