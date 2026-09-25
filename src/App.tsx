import { useCallback, useState } from 'react'
import { AppShell } from './components/AppShell'
import type { Tab } from './components/BottomNav'
import { ThresholdAlert } from './components/ThresholdAlert'
import { clearChecklist } from './lib/checklist'
import { clearPersonal, loadPersonal, savePersonal, type PersonalProfile } from './lib/personal'
import { clearProfile, loadProfile, saveProfile, type PersonaId, type Profile, type RegionId } from './lib/profile'
import { clearSettings, loadSettings, saveSettings } from './lib/settings'
import { suggestedThreshold } from './data/tailored'
import { ThemeContext } from './lib/theme'
import { useThemeSetting } from './lib/useThemeSetting'
import { ForecastScreen } from './screens/ForecastScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LiveMapScreen } from './screens/LiveMapScreen'
import { LocationScreen } from './screens/LocationScreen'
import { MaskGuideScreen } from './screens/MaskGuideScreen'
import { PersonalDetailsScreen } from './screens/PersonalDetailsScreen'
import { PersonaScreen } from './screens/PersonaScreen'
import { SafetyGuideScreen } from './screens/SafetyGuideScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SplashScreen } from './screens/SplashScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'

type Stage = 'splash' | 'welcome' | 'location' | 'persona' | 'details' | 'app'
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

  const finishOnboarding = (personal: PersonalProfile) => {
    if (!region || !persona) return
    const previous = loadPersonal()
    const next = { region, persona }
    saveProfile(next)
    savePersonal(personal)
    setProfile(next)

    /*
     * Start people at an alert level that matches who they told us about:
     * sensitive groups hear about it as soon as the air stops being good.
     *
     * Coming back through these questions from Settings only moves the level
     * if it is still the one we suggested last time. A level someone chose
     * themselves is theirs, and editing who the app is for must not undo it.
     */
    const settings = loadSettings(persona)
    const ours = !editing || settings.alertThreshold === suggestedThreshold(previous)
    if (ours) saveSettings({ ...settings, alertThreshold: suggestedThreshold(personal) })

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
    clearPersonal()
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
            onNext={() => setStage('details')}
          />
        )
      case 'details':
        return persona ? (
          <PersonalDetailsScreen persona={persona} onBack={() => setStage('persona')} onDone={finishOnboarding} />
        ) : null
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
                onOpenTrend={() => setTab('forecast')}
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
