import { useTheme, type ThemeType } from '../hooks/useTheme';
import '../styles/theme-switcher.css';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();

  const themes: { value: ThemeType; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'system', label: 'System', icon: '🖥️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
  ];

  return (
    <div className="theme-switcher">
      <div className="theme-selector">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`theme-option ${theme.type === t.value ? 'active' : ''}`}
            title={`${t.label} theme`}
          >
            <span className="theme-icon">{t.icon}</span>
            <span className="theme-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
