import { t } from '@/lib/i18n';
import { Avatar, IconButton, useConfirmModal } from '@afk/component';
import { SignOutIcon } from '@blocksuite/icons/rc';

import { useAuthStore } from '@/store/auth';

export const UserInfo = () => {
  const { user, logout } = useAuthStore();

  const { openConfirmModal } = useConfirmModal();

  const handleLogout = async () => {
    openConfirmModal({
      title: t("Sign out"),
      description: t("Are you sure you want to sign out?"),
      onConfirm: logout,
      cancelText: t('Cancel'),
      confirmText: t("Sign out"),
      confirmButtonOptions: {
        variant: 'error',
      },
    });
  };

  return (
    <div className="flex items-center justify-between px-1 gap-2 h-[42px]">
      <Avatar
        size={24}
        colorfulFallback
        name={user?.name ?? user?.email ?? ''}
      />
      <div className="text-sm w-0 flex-1 truncate flex items-center font-medium">
        {user?.name}
      </div>
      <IconButton icon={<SignOutIcon />} onClick={handleLogout} />
    </div>
  );
};
