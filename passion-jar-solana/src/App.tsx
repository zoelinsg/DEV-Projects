import { useEffect, useMemo, useState } from "react";
import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import "./App.css";
import {
  getExplorerUrl,
  getRecentTransactions,
  getSolBalance,
  PASSION_JAR_ADDRESS,
} from "./lib/solana";

type PassionAction = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

const PASSION_ACTIONS_STORAGE_KEY = "passion-jar-solana-actions";

const defaultActions: PassionAction[] = [
  {
    id: "default-1",
    title: "Created a dedicated Solana Devnet passion jar",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    title: "Funded the jar with devnet SOL",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    title: "Built a local dashboard for tracking passion activity",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

function loadStoredActions(): PassionAction[] {
  const storedActions = localStorage.getItem(PASSION_ACTIONS_STORAGE_KEY);

  if (!storedActions) {
    return defaultActions;
  }

  try {
    return JSON.parse(storedActions) as PassionAction[];
  } catch {
    return defaultActions;
  }
}

function App() {
  const [passionName, setPassionName] = useState("100 Days of Solana");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<ConfirmedSignatureInfo[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [actions, setActions] = useState<PassionAction[]>(loadStoredActions);
  const [newActionTitle, setNewActionTitle] = useState("");

  const completedActionCount = useMemo(() => {
    return actions.filter((action) => action.completed).length;
  }, [actions]);

  const passionScore = useMemo(() => {
    return completedActionCount * 10 + transactions.length * 5 + balanceScore(balance);
  }, [completedActionCount, transactions.length, balance]);

  function balanceScore(currentBalance: number | null) {
    if (!currentBalance) {
      return 0;
    }

    return Math.min(Math.floor(currentBalance * 10), 20);
  }

  async function loadJarData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [nextBalance, nextTransactions] = await Promise.all([
        getSolBalance(PASSION_JAR_ADDRESS),
        getRecentTransactions(PASSION_JAR_ADDRESS),
      ]);

      setBalance(nextBalance);
      setTransactions(nextTransactions);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load Solana Devnet data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function addAction() {
    const trimmedTitle = newActionTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    const nextAction: PassionAction = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setActions((currentActions) => [nextAction, ...currentActions]);
    setNewActionTitle("");
  }

  function toggleAction(actionId: string) {
    setActions((currentActions) =>
      currentActions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              completed: !action.completed,
            }
          : action,
      ),
    );
  }

  function deleteAction(actionId: string) {
    setActions((currentActions) =>
      currentActions.filter((action) => action.id !== actionId),
    );
  }

  function clearCompletedActions() {
    setActions((currentActions) =>
      currentActions.filter((action) => !action.completed),
    );
  }

  useEffect(() => {
    loadJarData();
  }, []);

  useEffect(() => {
    localStorage.setItem(PASSION_ACTIONS_STORAGE_KEY, JSON.stringify(actions));
  }, [actions]);

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Weekend Challenge: Passion Edition</p>
        <h1>Passion Jar Solana</h1>
        <p className="subtitle">
          Turn your passion into visible Solana Devnet activity.
        </p>
      </section>

      <section className="card">
        <label htmlFor="passion-name">What are you passionate about?</label>
        <input
          id="passion-name"
          value={passionName}
          onChange={(event) => setPassionName(event.target.value)}
          placeholder="100 Days of Solana"
        />

        <div className="jar-preview">
          <p className="label">Your Passion Jar</p>
          <h2>{passionName || "Untitled Passion"}</h2>
          <p>
            Every local action and devnet transaction becomes a small proof of
            commitment to what you care about.
          </p>
        </div>

        <div className="data-grid">
          <div className="stat-card">
            <p className="label">Devnet Jar Address</p>
            <code>{PASSION_JAR_ADDRESS}</code>
            <a
              href={getExplorerUrl(PASSION_JAR_ADDRESS, "address")}
              target="_blank"
              rel="noreferrer"
            >
              View address on Solana Explorer
            </a>
          </div>

          <div className="stat-card">
            <p className="label">Balance</p>
            <strong>
              {balance === null ? "Loading..." : `${balance.toFixed(6)} SOL`}
            </strong>
            <button onClick={loadJarData} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh Devnet Data"}
            </button>
          </div>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <div className="transactions">
          <p className="label">Recent Transactions</p>

          {transactions.length === 0 ? (
            <p className="muted">No recent transactions found yet.</p>
          ) : (
            <ul>
              {transactions.map((transaction) => (
                <li key={transaction.signature}>
                  <div>
                    <strong>
                      {transaction.signature.slice(0, 12)}...
                      {transaction.signature.slice(-12)}
                    </strong>
                    <span>
                      Slot {transaction.slot} ·{" "}
                      {transaction.confirmationStatus ?? "unknown"}
                    </span>
                  </div>

                  <a
                    href={getExplorerUrl(transaction.signature, "tx")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section className="actions-section">
          <div className="section-heading">
            <div>
              <p className="label">Passion Actions</p>
              <h3>Track what you did for your passion</h3>
            </div>

            <div className="score-card">
              <span>Passion Score</span>
              <strong>{passionScore}</strong>
            </div>
          </div>

          <div className="action-form">
            <input
              value={newActionTitle}
              onChange={(event) => setNewActionTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addAction();
                }
              }}
              placeholder="Example: Completed Solana wallet setup"
            />
            <button onClick={addAction}>Add Action</button>
          </div>

          <div className="action-summary">
            <span>
              {completedActionCount} of {actions.length} actions completed
            </span>

            <button
              className="ghost-button"
              onClick={clearCompletedActions}
              disabled={completedActionCount === 0}
            >
              Clear Completed
            </button>
          </div>

          {actions.length === 0 ? (
            <p className="muted">
              No actions yet. Add one small step you took for your passion.
            </p>
          ) : (
            <ul className="action-list">
              {actions.map((action) => (
                <li
                  key={action.id}
                  className={action.completed ? "action completed" : "action"}
                >
                  <button
                    className="check-button"
                    onClick={() => toggleAction(action.id)}
                    aria-label={
                      action.completed
                        ? "Mark action as incomplete"
                        : "Mark action as complete"
                    }
                  >
                    {action.completed ? "✓" : ""}
                  </button>

                  <div className="action-content">
                    <strong>{action.title}</strong>
                    <span>
                      Added{" "}
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(action.createdAt))}
                    </span>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deleteAction(action.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;