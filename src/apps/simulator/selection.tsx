'use client';
import {
  GiNuclearBomb,
  GiAsteroid,
  GiFactory,
  GiSmallFire,
  GiDisintegrate,
  GiTerror,
  GiQuicksand,
  GiMiddleArrow,
  GiFastArrow,
  GiResize,
  GiBurningSkull,
  GiCometSpark,
  GiBurningMeteor,
} from '@/components/ui/icons';
import { RiVirusFill, RiFloodFill, RiEarthquakeFill } from '@/components/ui/icons';
import { MdPhotoSizeSelectSmall } from '@/components/ui/icons';
import { SiMeteor } from '@/components/ui/icons';
import { catalog } from '@/core/catalog';
import { useState, type ReactNode } from 'react';
import { type Named, label } from '@/core/catalog';
import { usePreferences } from '@/apps/shell/preferences';
import { useTranslation } from '@/apps/shell/use-translation';
import { Modal } from '@/components/ui/modal';
import { MenuItem } from '@/components/ui/menu-item';
import { IconButton } from '@/components/ui/icon-button';
import ui from '@/components/ui/ui.module.css';
import styles from './settings.module.css';
export type Option = Named & {
  description_ru?: string | null;
  description_en?: string | null;
  charge?: number;
};
export function Selection({
  title,
  placeholder,
  items,
  value,
  onChange,
  icon,
  noDescription = false,
}: {
  title: string;
  placeholder: string;
  items: readonly Option[];
  value: number | null;
  onChange: (value: number) => void;
  icon: ReactNode;
  noDescription?: boolean;
}) {
  const { locale } = usePreferences();
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState(1);
  const optionIcons =
    items === catalog.disastertype
      ? [GiNuclearBomb, RiVirusFill, RiFloodFill, RiEarthquakeFill, GiAsteroid, GiFactory]
      : items === catalog.lvl
        ? [GiSmallFire, GiDisintegrate, GiTerror]
        : items === catalog.duration
          ? [GiQuicksand, GiMiddleArrow, GiFastArrow]
          : items === catalog.scale
            ? [MdPhotoSizeSelectSmall, GiResize, GiBurningSkull]
            : items === catalog.typespaceobject
              ? [GiCometSpark, GiBurningMeteor, SiMeteor]
              : [];
  const current = items.find((i) => i.id === value);
  const long = items.length > 10;
  const shown = items
    .filter((item) =>
      label(item, locale).toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale)),
    )
    .toSorted((a, b) =>
      long
        ? direction *
          (a.charge !== undefined && b.charge !== undefined
            ? a.charge - b.charge
            : label(a, locale).localeCompare(label(b, locale), locale))
        : a.id - b.id,
    );
  return (
    <div className={styles.selection}>
      <button
        className={`${ui.menuButton} ${open ? styles.selectionOpen : ''}`}
        onClick={() => {
          setSearch('');
          setOpen(true);
        }}
        aria-label={title}
      >
        <MenuItem
          title={title}
          description={current ? label(current, locale) : placeholder}
          warning={!current}
          icon={icon}
        />
      </button>
      {open && (
        <Modal label={title} fixed={long} onClose={() => setOpen(false)}>
          {long && (
            <div className={styles.search}>
              <input
                autoComplete="off"
                className={`${ui.input} ${ui.noTransform} ${ui.noShadow}`}
                placeholder={t('settings.search')}
                aria-label={t('settings.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconButton
                icon="sortAsc"
                label={locale === 'ru' ? 'По возрастанию' : 'Ascending'}
                onClick={() => setDirection(1)}
              />
              <IconButton
                icon="sortDesc"
                label={locale === 'ru' ? 'По убыванию' : 'Descending'}
                onClick={() => setDirection(-1)}
              />
            </div>
          )}
          <div className={long ? styles.options : undefined}>
            {shown.map((item, i) => {
              const OptionIcon = optionIcons[item.id - 1];
              return (
                <button
                  key={item.id}
                  className={`${ui.menuButton} ${long ? `${ui.noTransform} ${styles.option}` : ''}`}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <MenuItem
                    icon={OptionIcon ? <OptionIcon /> : undefined}
                    title={`${label(item, locale)}${item.charge !== undefined ? ` (${t('settings.disaster.Atomic bomb.measure', { charge: item.charge })})` : ''}`}
                    description={item[`description_${locale}`]}
                    hoverDescription={items.length >= 4 || noDescription}
                    flat={long}
                    odd={i % 2 === 1}
                  />
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
