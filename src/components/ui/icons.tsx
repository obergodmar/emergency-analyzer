import { createElement, type SVGProps, type ReactNode } from 'react';
import artwork from '@/core/icons/legacy.json';

type Node = { tag: string; attrs: Record<string, string | undefined>; children: Node[] };

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function renderNode(node: Node, key: number): ReactNode {
  return createElement(node.tag, { ...node.attrs, key }, node.children.map(renderNode));
}

function icon(name: keyof typeof artwork) {
  const definition = artwork[name];

  return function Icon({ size = '1em', ...props }: IconProps) {
    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox={definition.viewBox}
        height={size}
        width={size}
        aria-hidden="true"
        {...props}
      >
        {definition.children.map(renderNode)}
      </svg>
    );
  };
}

export const AiFillCloseCircle = icon('AiFillCloseCircle');
export const AiFillInfoCircle = icon('AiFillInfoCircle');
export const AiFillWarning = icon('AiFillWarning');
export const AiOutlineCloseCircle = icon('AiOutlineCloseCircle');
export const AiOutlineInfoCircle = icon('AiOutlineInfoCircle');
export const AiOutlineSortAscending = icon('AiOutlineSortAscending');
export const AiOutlineSortDescending = icon('AiOutlineSortDescending');
export const AiOutlineWarning = icon('AiOutlineWarning');
export const BiLoaderAlt = icon('BiLoaderAlt');
export const BsBell = icon('BsBell');
export const BsBellFill = icon('BsBellFill');
export const CgDarkMode = icon('CgDarkMode');
export const CgFormatSlash = icon('CgFormatSlash');
export const FaMapMarkedAlt = icon('FaMapMarkedAlt');
export const FaSave = icon('FaSave');
export const GiAbstract096 = icon('GiAbstract096');
export const GiAsteroid = icon('GiAsteroid');
export const GiBandaged = icon('GiBandaged');
export const GiBleedingEye = icon('GiBleedingEye');
export const GiBleedingHeart = icon('GiBleedingHeart');
export const GiBurningMeteor = icon('GiBurningMeteor');
export const GiBurningSkull = icon('GiBurningSkull');
export const GiCometSpark = icon('GiCometSpark');
export const GiDisintegrate = icon('GiDisintegrate');
export const GiFactory = icon('GiFactory');
export const GiFastArrow = icon('GiFastArrow');
export const GiMaterialsScience = icon('GiMaterialsScience');
export const GiMeteorImpact = icon('GiMeteorImpact');
export const GiMiddleArrow = icon('GiMiddleArrow');
export const GiNuclearBomb = icon('GiNuclearBomb');
export const GiQuicksand = icon('GiQuicksand');
export const GiResize = icon('GiResize');
export const GiSettingsKnobs = icon('GiSettingsKnobs');
export const GiSmallFire = icon('GiSmallFire');
export const GiTerror = icon('GiTerror');
export const GiTreasureMap = icon('GiTreasureMap');
export const MdDataUsage = icon('MdDataUsage');
export const MdLanguage = icon('MdLanguage');
export const MdPhotoSizeSelectSmall = icon('MdPhotoSizeSelectSmall');
export const RiAlarmWarningFill = icon('RiAlarmWarningFill');
export const RiAlarmWarningLine = icon('RiAlarmWarningLine');
export const RiEarthquakeFill = icon('RiEarthquakeFill');
export const RiFloodFill = icon('RiFloodFill');
export const RiVirusFill = icon('RiVirusFill');
export const SiMeteor = icon('SiMeteor');
export const TiArrowBack = icon('TiArrowBack');
export const TiArrowBackOutline = icon('TiArrowBackOutline');
export const TiDownload = icon('TiDownload');
export const TiDownloadOutline = icon('TiDownloadOutline');
export const TiMediaFastForward = icon('TiMediaFastForward');
export const TiMediaFastForwardOutline = icon('TiMediaFastForwardOutline');
export const TiMediaPause = icon('TiMediaPause');
export const TiMediaPauseOutline = icon('TiMediaPauseOutline');
export const TiMediaPlay = icon('TiMediaPlay');
export const TiMediaPlayOutline = icon('TiMediaPlayOutline');
export const TiMediaStop = icon('TiMediaStop');
export const TiMediaStopOutline = icon('TiMediaStopOutline');
export const VscDebugStart = icon('VscDebugStart');
export const VscReferences = icon('VscReferences');
export const VscReport = icon('VscReport');
export const VscSettingsGear = icon('VscSettingsGear');
