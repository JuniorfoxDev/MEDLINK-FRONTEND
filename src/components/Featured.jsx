const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#cedbe9] bg-slate-50 p-4">
      <div className="text-[#0d141c]">{icon}</div>
      <div>
        <h2 className="text-[#0d141c] text-base font-bold">{title}</h2>
        <p className="text-[#48739d] text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
