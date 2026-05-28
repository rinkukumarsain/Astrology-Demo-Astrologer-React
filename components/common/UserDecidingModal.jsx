import React from 'react';
import { Hourglass } from 'lucide-react';

const UserDecidingModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
          <Hourglass className="h-8 w-8 text-[#e36749]" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">User is deciding</h3>
        <p className="text-sm text-gray-500">
          Please wait while the user decides whether to continue the chat...
        </p>
      </div>
    </div>
  );
};

export default UserDecidingModal;
