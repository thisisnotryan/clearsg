/*
 * Icons exported from Figma. Most are dark-mode artwork that also reads on
 * white; the ones the light designs restyle live in figma/light/ and override
 * the dark set here.
 */
import { useTheme, type Theme } from '../lib/theme'

import backArrow from './figma/back-arrow.png'
import check from './figma/check.png'
import dots1 from './figma/dots-1.svg'
import dots2 from './figma/dots-2.svg'
import dots3 from './figma/dots-3.svg'
import dropdownArrow from './figma/dropdown-arrow.png'
import forward from './figma/forward.png'
import forwardSmall from './figma/forward-small.png'
import gear from './figma/gear.png'
import highImportance from './figma/high-importance.png'
import house from './figma/house.png'
import legendGood from './figma/legend-good.svg'
import legendModerate from './figma/legend-moderate.svg'
import legendUnhealthy from './figma/legend-unhealthy.svg'
import liveDot from './figma/live-dot.svg'
import logout from './figma/logout.png'
import mapPin from './figma/map-pin.png'
import navHome from './figma/nav-home.png'
import navHomeActive from './figma/nav-home-active.png'
import navLocation from './figma/nav-location.png'
import navLocationActive from './figma/nav-location-active.png'
import navSettings from './figma/nav-settings.png'
import navSettingsActive from './figma/nav-settings-active.png'
import navStats from './figma/nav-stats.png'
import navStatsActive from './figma/nav-stats-active.png'
import personaMyself from './figma/persona-myself.svg'
import personaMyselfSelected from './figma/persona-myself-selected.svg'
import personaOnTheGo from './figma/persona-onthego.png'
import personaOnTheGoSelected from './figma/persona-onthego-selected.png'
import personaSomeone from './figma/persona-someone.png'
import personaSomeoneSelected from './figma/persona-someone-selected.png'
import pin from './figma/pin.png'
import pinSmall from './figma/pin-small.png'
import protectGood from './figma/protect-good.png'
import protectModerate from './figma/protect-moderate.png'
import protectUnhealthy from './figma/protect-unhealthy.png'
import radar from './figma/radar.png'
import refresh from './figma/refresh.png'
import refresh30 from './figma/refresh-30.png'
import shield from './figma/shield.png'
import slider from './figma/slider.png'
import stethoscope from './figma/stethoscope.png'
import toggleOff from './figma/toggle-off.svg'
import toggleOn from './figma/toggle-on.svg'
import trendDown from './figma/trend-down.png'
import trendUp from './figma/trend-up.png'
import walking from './figma/walking.png'

import lightBackArrow from './figma/light/back-arrow.png'
import lightDropdownArrow from './figma/light/dropdown-arrow.png'
import lightForwardSmall from './figma/light/forward-small.png'
import lightGear from './figma/light/gear.png'
import lightHighImportance from './figma/light/high-importance.png'
import lightHouse from './figma/light/house.png'
import lightLegendGood from './figma/light/legend-good.svg'
import lightLegendModerate from './figma/light/legend-moderate.svg'
import lightLegendUnhealthy from './figma/light/legend-unhealthy.svg'
import lightNavHomeActive from './figma/light/nav-home-active.png'
import lightNavLocationActive from './figma/light/nav-location-active.png'
import lightNavSettingsActive from './figma/light/nav-settings-active.png'
import lightNavStatsActive from './figma/light/nav-stats-active.png'
import lightPersonaMyself from './figma/light/persona-myself.svg'
import lightPersonaOnTheGo from './figma/light/persona-onthego.png'
import lightPersonaSomeone from './figma/light/persona-someone.png'
import lightPin from './figma/light/pin.png'
import lightPinSmall from './figma/light/pin-small.png'
import lightRefresh from './figma/light/refresh.png'
import lightRefresh30 from './figma/light/refresh-30.png'
import lightSlider from './figma/light/slider.png'
import lightStethoscope from './figma/light/stethoscope.png'
import lightToggleOff from './figma/light/toggle-off.svg'
import lightToggleOn from './figma/light/toggle-on.svg'
import lightWalking from './figma/light/walking.png'

const DARK_ICONS = {
  backArrow,
  check,
  dots: [dots1, dots2, dots3],
  dropdownArrow,
  forward,
  forwardSmall,
  gear,
  highImportance,
  house,
  legendGood,
  legendModerate,
  legendUnhealthy,
  liveDot,
  logout,
  mapPin,
  navHome,
  navHomeActive,
  navLocation,
  navLocationActive,
  navSettings,
  navSettingsActive,
  navStats,
  navStatsActive,
  personaMyself,
  personaMyselfSelected,
  personaOnTheGo,
  personaOnTheGoSelected,
  personaSomeone,
  personaSomeoneSelected,
  pin,
  pinSmall,
  protectGood,
  protectModerate,
  protectUnhealthy,
  radar,
  refresh,
  refresh30,
  shield,
  slider,
  stethoscope,
  toggleOff,
  toggleOn,
  trendDown,
  trendUp,
  walking,
}

export type IconSet = typeof DARK_ICONS

const LIGHT_ICONS: IconSet = {
  ...DARK_ICONS,
  backArrow: lightBackArrow,
  dropdownArrow: lightDropdownArrow,
  forwardSmall: lightForwardSmall,
  gear: lightGear,
  highImportance: lightHighImportance,
  house: lightHouse,
  legendGood: lightLegendGood,
  legendModerate: lightLegendModerate,
  legendUnhealthy: lightLegendUnhealthy,
  navHomeActive: lightNavHomeActive,
  navLocationActive: lightNavLocationActive,
  navSettingsActive: lightNavSettingsActive,
  navStatsActive: lightNavStatsActive,
  personaMyself: lightPersonaMyself,
  personaOnTheGo: lightPersonaOnTheGo,
  personaSomeone: lightPersonaSomeone,
  pin: lightPin,
  pinSmall: lightPinSmall,
  refresh: lightRefresh,
  refresh30: lightRefresh30,
  slider: lightSlider,
  stethoscope: lightStethoscope,
  toggleOff: lightToggleOff,
  toggleOn: lightToggleOn,
  walking: lightWalking,
}

export const ICONS: Record<Theme, IconSet> = { dark: DARK_ICONS, light: LIGHT_ICONS }

export function useIcons() {
  return ICONS[useTheme()]
}
