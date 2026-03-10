import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { FraudRuleSection } from "../components/FraudRuleSection";
import { LookupConfigurationSection } from "../components/LookupConfigurationSection";
import { WorkflowSettingSection } from "../components/WorkflowSettingSection";

const tabs = [
  { label: "Insurance Products", key: "InsuranceProduct" as const },
  { label: "Policy Types", key: "PolicyType" as const },
  { label: "Claim Types", key: "ClaimType" as const },
  { label: "Claim Status", key: "ClaimStatus" as const },
  { label: "Fraud Rules", key: "FraudRules" as const },
  { label: "Workflow Settings", key: "WorkflowSettings" as const }
];

export function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        System Configuration
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, nextValue: number) => setActiveTab(nextValue)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      {activeTab === 0 ? <LookupConfigurationSection configType="InsuranceProduct" title="Insurance Products" /> : null}
      {activeTab === 1 ? <LookupConfigurationSection configType="PolicyType" title="Policy Types" /> : null}
      {activeTab === 2 ? <LookupConfigurationSection configType="ClaimType" title="Claim Types" /> : null}
      {activeTab === 3 ? <LookupConfigurationSection configType="ClaimStatus" title="Claim Status" /> : null}
      {activeTab === 4 ? <FraudRuleSection /> : null}
      {activeTab === 5 ? <WorkflowSettingSection /> : null}
    </Box>
  );
}
