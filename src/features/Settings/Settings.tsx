import { 
  User, 
  FileText,
  Plug
} from "lucide-react";
import useSettingsContainer from "./Settings.container";
import { ProfileTab, PolicyTab, IntegrationsTab } from "./";

export default function Settings() {
  const {
    activeTab,
    setActiveTab,
  } = useSettingsContainer();

  const tabs = [
    {
      id: "profile" as const,
      name: "Perfil",
      icon: User,
      description: "Gerencie suas informações pessoais"
    },
    {
      id: "integrations" as const,
      name: "Integrações",
      icon: Plug,
      description: "Conecte e gerencie suas integrações"
    },
    {
      id: "policy" as const,
      name: "Política de Reembolso",
      icon: FileText,
      description: "Envie sua política em PDF para processamento"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Configurações
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Gerencie suas configurações e preferências
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-1.5 py-1.5 px-1 border-b-2 font-medium text-xs transition-colors
                  ${activeTab === tab.id
                    ? 'border-green-700 text-green-600 dark:text-green-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "policy" && <PolicyTab />}
      </div>
    </div>
  );
}
