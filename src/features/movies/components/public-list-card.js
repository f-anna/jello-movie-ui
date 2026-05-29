import React from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { getImageUrl } from '../../../lib/api-client';
import { getInitials } from '../../../lib/utils';
import { getListTypeName, getListBadgeClassName } from '../../../constants/listTypes';

export const PublicListCard = ({ list, owner, onClick, onOwnerClick, footerAction }) => {
  const posters = (list.listItems || [])
    .map((item) => item.movie?.posterPath)
    .filter(Boolean)
    .slice(0, 4);
  const extra = (list.listItems?.length || 0) - posters.length;
  const ownerName = owner?.userName || owner?.email;
  const count = list.listItems?.length || 0;

  return (
    <Card className="follow-card follow-list-card" onClick={onClick}>
      <div className="follow-list-poster-strip">
        {posters.length > 0 ? (
          <>
            {posters.map((path, i) => (
              <img
                key={i}
                src={getImageUrl(path)}
                alt=""
                className="follow-list-poster"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ))}
            {extra > 0 && <div className="follow-list-poster-more">+{extra}</div>}
          </>
        ) : (
          <div className="follow-list-poster-empty">
            <i className="pi pi-video" />
          </div>
        )}
      </div>
      <div className="follow-list-body">
        <div className="follow-list-title-row">
          <span className="follow-card-name">{list.name}</span>
          <Badge
            value={getListTypeName(list.listTypeId)}
            className={getListBadgeClassName(list.listTypeId)}
          />
        </div>
        {owner && (
          <span
            className="follow-list-owner"
            onClick={onOwnerClick ? (e) => { e.stopPropagation(); onOwnerClick(); } : undefined}
          >
            <Avatar
              image={owner.profilePictureUrl ? getImageUrl(owner.profilePictureUrl) : undefined}
              label={owner.profilePictureUrl ? undefined : getInitials(ownerName)}
              size="small"
              shape="circle"
              className="follow-list-owner-avatar"
            />
            {ownerName || 'Unknown'}
          </span>
        )}
        {list.description && (
          <p className="follow-list-description">{list.description}</p>
        )}
        <div className="follow-list-footer">
          <span className="follow-list-meta">
            <i className="pi pi-video" />
            {count} {count === 1 ? 'movie' : 'movies'}
          </span>
          {footerAction ?? (
            <i className="pi pi-chevron-right follow-list-chevron" />
          )}
        </div>
      </div>
    </Card>
  );
};
