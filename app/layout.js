import Image from "next/image";

export default function Layout({ children }) {
  return (
    <>
      <header style={{padding:"20px"}}>
        <Image
          src="/logo-cablecore.svg"
          alt="CableCore"
          width={180}
          height={50}
        />
      </header>

      {children}
    </>
  );
}
