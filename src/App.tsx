import { useCallback, useState } from 'react'
import { AppShell } from './components/AppShell'
import type { Tab } from './components/BottomNav'
import { ThresholdAlert } from './components/ThresholdAlert'
import { clearChecklist } from './lib/checklist'
import { clearProfile, loadProfile, saveProfile, type PersonaId, type Profile, type RegionId } from './lib/profile'
import { clearSettings } from './lib/settings'
import { ThemeContext } from './lib/theme'
import { useThemeSetting } from './lib/useThemeSetting'
import { ForecastScreen } from './screens/ForecastScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LiveMapScreen } from './screens/LiveMapScreen'
import { LocationScreen } from './screens/LocationScreen'
import { MaskGuideScreen } from './screens/MaskGuideScreen'
import { PersonaScreen } from './screens/PersonaScreen'
import { SafetyGuideScreen } from './screens/SafetyGuideScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SplashScreen } from './screens/SplashScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'

type Stage = 'splash' | 'welcome' | 'location' | 'persona' | 'app'
/**
 * Full-screen guides that open over a tab and have no nav bar. `from` is
 * where the guide was opened from, so Back returns there.
 */
type Guide = { screen: 'mask' | 'safety'; from: 'tab' | 'mask' } | null

export default function App() {
  const [stage, setStage] = useState<Stage>('splash')
  const [tab, setTab] = useState<Tab>('home')
  const [guide, setGuide] = useState<Guide>(null)
  const [profile, setProfile] = useState<Profile | null>(loadProfile)
  const [region, setRegion] = useState<RegionId | null>(profile?.region ?? null)
  const [persona, setPersona] = useState<PersonaId | null>(profile?.persona ?? null)
  // Editing from Settings runs the same steps, then goes back to Settings.
  const [editing, setEditing] = useState(false)
  const theme = useThemeSetting(profile?.persona)

  // Returning users skip onboarding.
  const finishSplash = useCallback(() => setStage(profile ? 'app' : 'welcome'), [profile])

  const finishOnboarding = () => {
    if (!region || !persona) return
    const next = { region, persona }
    saveProfile(next)
    setProfile(next)
    setTab(editing ? 'settings' : 'home')
    setEditing(false)
    setStage('app')
  }

  const editProfile = () => {
    setEditing(true)
    setStage('location')
  }

  const signOut = () => {
    clearProfile()
    clearSettings()
    setProfile(null)
    setRegion(null)
    setPersona(null)
    clearChecklist()
    setGuide(null)
    setEditing(false)
    setStage('welcome')
  }

  const screen = () => {
    switch (stage) {
      case 'splash':
        return <SplashScreen onDone={finishSplash} />
      case 'welcome':
        return <WelcomeScreen onNext={() => setStage('location')} />
      case 'location':
        return (
          <LocationScreen
            region={region}
            onChange={setRegion}
            onBack={() => (editing ? setStage('app') : setStage('welcome'))}
            onNext={() => setStage('persona')}
          />
        )
      case 'persona':
        return (
          <PersonaScreen
            persona={persona}
            onChange={setPersona}
            onBack={() => setStage('location')}
            onNext={finishOnboarding}
          />
        )
      case 'app': {
        if (!profile) return null
        if (guide?.screen === 'mask') {
          return (
            <MaskGuideScreen
              profile={profile}
              onBack={() => setGuide(null)}
              onOpenSafetyGuide={() => setGuide({ screen: 'safety', from: 'mask' })}
            />
          )
        }
        if (guide?.screen === 'safety') {
          const back = guide.from === 'mask' ? { screen: 'mask' as const, from: 'tab' as const } : null
          return <SafetyGuideScreen profile={profile} onBack={() => setGuide(back)} />
        }
        return (
          <AppShell
            tab={tab}
            onTabChange={(next) => {
              setGuide(null)
              setTab(next)
            }}
            banner={
              <ThresholdAlert profile={profile} onOpenGuide={() => setGuide({ screen: 'safety', from: 'tab' })} />
            }
          >
            {tab === 'home' ? (
              <HomeScreen
                profile={profile}
                onOpenSettings={() => setTab('settings')}
                onOpenMaskGuide={() => setGuide({ screen: 'mask', from: 'tab' })}
              />
            ) : tab === 'forecast' ? (
              <ForecastScreen profile={profile} onBack={() => setTab('home')} />
            ) : tab === 'map' ? (
              <LiveMapScreen
                profile={profile}
                onBack={() => setTab('home')}
                onOpenSafetyGuide={() => setGuide({ screen: 'safety', from: 'tab' })}
              />
            ) : (
              <SettingsScreen
                profile={profile}
                onBack={() => setTab('home')}
                onEditProfile={editProfile}
                onSignOut={signOut}
              />
            )}
          </AppShell>
        )
      }
    }
  }

  return <ThemeContext.Provider value={theme}>{screen()}</ThemeContext.Provider>
}
