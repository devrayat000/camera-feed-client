import { Form } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export default function HomeScreen() {
  return (
    <div className="grid place-items-center min-h-screen dark bg-background text-foreground">
      <Form
        action="./feed"
        method="GET"
        className="px-6 pb-10 pt-4 rounded-lg border border-border"
      >
        <h3 className="font-bold text-center text-4xl">PROCHESTA v3.0</h3>
        <div className="flex gap-x-4 items-center mt-6">
          <Input
            type="text"
            name="ip"
            placeholder="IP"
            className="grow shrink basis-full"
          />
          <Input
            type="text"
            name="port"
            placeholder="Port"
            className="grow shrink basis-2/4"
          />
        </div>
        <Button type="submit" className="w-full mt-4">
          Connect
        </Button>
      </Form>
    </div>
  );
}
