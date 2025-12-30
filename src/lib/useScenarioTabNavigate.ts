import { useNavigate } from "react-router-dom";

export function useScenarioTabNavigate() {
  const navigate = useNavigate();
  return (tab: 'passed' | 'gm-ready') => {
    navigate(`/scenario?tab=${tab}`);
  };
}
