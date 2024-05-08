import SingleFeed from "./components/SingleFeed_2";

export default function FeedScreen() {
  return (
    <div className="bg-slate-800 h-screen">
      <div className="w-full flex gap-6 flex-wrap items-center justify-between p-6">
        {[0, 1, 2, 3].map((index) => (
          <SingleFeed key={index} index={index} />
        ))}
      </div>
    </div>
  );
}
