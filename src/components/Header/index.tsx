import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image
          src="/spacetraveling-logo.svg"
          width={238}
          height={79}
          alt="logo"
        />
      </Link>
    </header>
  );
}
