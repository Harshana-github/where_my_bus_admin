import React, { useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import { useAuthStore } from '../../stores/useAuthStore';
import './UserPanel.scss';

export default function UserPanel({ menuMode }) {
  const logoutUser = useAuthStore(state => state.logoutUser);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const navigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const menuItems = useMemo(() => ([
    {
      text: 'Profile',
      icon: 'user',
      onClick: navigateToProfile
    },
    {
      text: 'Logout',
      icon: 'runner',
      onClick: logoutUser
    }
  ]), [navigateToProfile, logoutUser]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton
          stylingMode='text'
          icon='/assets/images/user.png'
          showArrowIcon={false}
          elementAttr={dropDownButtonAttributes}
          dropDownOptions={buttonDropDownOptions}
          items={menuItems}>
        </DropDownButton>
      )}
      {menuMode === 'list' && (
        <List items={menuItems} />
      )}
    </div>
  );
}