import { 
  User, 
  Mail
} from "lucide-react";
import useSettingsContainer from "./Settings.container";
import { ProfileTab, EmailTab } from "./";

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
      id: "email" as const,
      name: "Email",
      icon: Mail,
      description: "Endereços de email"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Configurações
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie suas configurações e preferências
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "email" && <EmailTab />}
      </div>
    </div>
  );
}
