import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import {
  CurrentAccountProvider,
  useCurrentAccount,
} from "./hooks/useCurrentAccount";
import { BalanceProvider } from "./hooks/useBalance";
import { ToastProvider } from "./components/Toast";
import { useLedgerHealth } from "./hooks/useLedgerHealth";
import { AppHeader } from "./components/AppHeader";
import { Card } from "./components/Card";
import { AuthScreen } from "./features/auth/AuthScreen";

import { AccountCreate } from "./features/account/AccountCreate";
import { AccountSelector } from "./features/account/AccountSelector";
import { AccountDashboard } from "./features/account/AccountDashboard";
import { DepositForm } from "./features/movement/DepositForm";
import { WithdrawForm } from "./features/movement/WithdrawForm";
import { TransferForm } from "./features/movement/TransferForm";
import { TransferLookup } from "./features/transfers/TransferLookup";
import { ReconciliationPanel } from "./features/reconciliation/ReconciliationPanel";

/** Tabs every signed-in user gets. Reconciliation is appended only for ADMIN. */
const BASE_TABS = [
  { id: "account", label: "Account" },
  { id: "dashboard", label: "Dashboard" },
  { id: "movement", label: "Money Movement" },
  { id: "lookup", label: "Transfer Lookup" },
] as const;

const ADMIN_TAB = { id: "reconciliation", label: "Reconciliation" } as const;

type TabId = (typeof BASE_TABS)[number]["id"] | typeof ADMIN_TAB.id;

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CurrentAccountProvider>
          <BalanceProvider>
            <Gate />
          </BalanceProvider>
        </CurrentAccountProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

/** Every endpoint but health/register/login needs a token — gate the whole app on it. */
function Gate() {
  const { session, expired } = useAuth();
  if (!session) {
    return (
      <AuthScreen
        notice={expired ? "Your session expired. Please sign in again." : null}
      />
    );
  }
  return <Shell />;
}

function Shell() {
  const { status, lastCheckedAt, refresh } = useLedgerHealth();
  const { account, clearAccount } = useCurrentAccount();
  const { session, logout } = useAuth();
  const isAdmin = session?.role === "ADMIN";
  const tabs = useMemo(
    () => (isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS),
    [isAdmin],
  );
  const [tab, setTab] = useState<TabId>("account");

  function handleLogout() {
    logout();
    clearAccount();
  }

  return (
    <div className="app-shell min-h-screen">
      <AppHeader
        status={status}
        lastCheckedAt={lastCheckedAt}
        onRefreshHealth={refresh}
        account={account}
        session={session}
        onLogout={handleLogout}
      />

      {/* Tab navigation */}
      <nav className="workspace-nav sticky top-0 z-30">
        <div className="workspace-width px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto py-2" role="tablist">
            {tabs.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`workspace-tab relative whitespace-nowrap px-4 py-2.5 text-sm transition ${
                    active
                      ? "workspace-tab-active"
                      : "workspace-tab-idle"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="workspace-tab-marker absolute inset-x-3 bottom-0 h-0.5 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="workspace-width px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        {tab === "account" && <AccountTab />}
        {tab === "dashboard" && <DashboardTab />}
        {tab === "movement" && <MovementTab />}
        {tab === "lookup" && <LookupTab />}
        {tab === "reconciliation" && isAdmin && <ReconciliationTab />}
      </main>

      <footer className="workspace-footer workspace-width px-4 pb-8 pt-3 text-xs sm:px-6 lg:px-8">
        Ledger-Core console. Learning and portfolio project. Backend may
        cold-start after inactivity.
      </footer>
    </div>
  );
}

/* ----------------------------- Tab contents ----------------------------- */

function AccountTab() {
  return (
    <div className="workspace-grid grid gap-6 lg:grid-cols-2">
      <Card
        title="Create an account"
        description="Open a new account. It's yours — scoped to your signed-in user."
      >
        <AccountCreate />
      </Card>
      <Card
        title="Select an existing account"
        description="Enter an account ID to make it your current account."
      >
        <AccountSelector />
      </Card>
    </div>
  );
}

function DashboardTab() {
  return (
    <div className="workspace-single">
      <div className="workspace-page-heading">
        <h2>Account dashboard</h2>
        <p>Live balance from the backend.</p>
      </div>
      <AccountDashboard />
    </div>
  );
}

function MovementTab() {
  return (
    <div className="space-y-6">
      <div className="workspace-grid grid gap-6 lg:grid-cols-2">
        <Card title="Deposit" description="Add funds to the current account.">
          <DepositForm />
        </Card>
        <Card title="Withdraw" description="Remove funds from the current account.">
          <WithdrawForm />
        </Card>
      </div>
      <div className="max-w-3xl mx-auto">
        <Card
          title="Transfer"
          description="Move money to another account with a safe, retryable idempotency key."
        >
          <TransferForm />
        </Card>
      </div>
    </div>
  );
}

function LookupTab() {
  return (
    <div className="workspace-single">
      <Card
        title="Transfer details lookup"
        description="Fetch a transfer by its ID."
      >
        <TransferLookup />
      </Card>
    </div>
  );
}

function ReconciliationTab() {
  return (
    <Card
      title="Reconciliation"
      description="Run a balance reconciliation sweep and inspect any breaks between ledger-derived and stored balances."
    >
      <ReconciliationPanel />
    </Card>
  );
}
