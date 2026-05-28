export default function AuthLayout({ children }) {
  return (
    <>
      <div className="h-full overflow-hidden">
        <video className="size-full object-cover max-md:hidden "
           src="https://nashatra-s3.s3.ap-south-1.amazonaws.com/login_bg1-2.mp4"
          // src="assets/video/Gunna_Writing_In_Fire_Meme_Download.mp4"
          autoPlay muted loop></video>
        <div className="md:fixed top-0 left-0 size-full bg-primary-light md:bg-black/30 flex items-center justify-center">
          <div className="h-dvh md:max-h-[92dvh] md:h-full w-full md:max-w-123 bg-primary-light md:rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}