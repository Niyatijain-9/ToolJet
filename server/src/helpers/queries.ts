import { App } from 'src/entities/app.entity';
import { Folder } from 'src/entities/folder.entity';
import { User } from 'src/entities/user.entity';
import { UserGroupPermission } from 'src/entities/user_group_permission.entity';
import { Brackets, createQueryBuilder, SelectQueryBuilder } from 'typeorm';
import { isSuperAdmin } from './utils.helper';

export function viewableAppsQuery(
  user: User,
  isLicenseValid: boolean,
  searchKey?: string,
  select?: Array<string>,
  type?: string
): SelectQueryBuilder<App> {
  const viewableAppsQb = createQueryBuilder(App, 'viewable_apps');

  if (select) {
    viewableAppsQb.select(select.map((col) => `viewable_apps.${col}`));
  }

  viewableAppsQb.innerJoin('viewable_apps.user', 'user').addSelect(['user.firstName', 'user.lastName']);

  if (!isSuperAdmin(user)) {
    viewableAppsQb
      .innerJoin('viewable_apps.groupPermissions', 'group_permissions')
      .innerJoinAndSelect('viewable_apps.appGroupPermissions', 'app_group_permissions')

      .innerJoin(
        UserGroupPermission,
        'user_group_permissions',
        'app_group_permissions.group_permission_id = user_group_permissions.group_permission_id'
      )
      .innerJoinAndSelect('app_group_permissions.groupPermission', 'groupPermission')
      .andWhere(
        new Brackets((qb) => {
          if (!isLicenseValid) {
            qb.andWhere('groupPermission.group IN (:...groups)', { groups: ['admin', 'all_users'] });
          }
          qb.andWhere('user_group_permissions.user_id = :userId', {
            userId: user.id,
          })
            .andWhere('app_group_permissions.read = :value', { value: true })
            .andWhere('app_group_permissions.hide_from_dashboard = :hideFromDashboard', {
              hideFromDashboard: false,
            })
            .orWhere('viewable_apps.is_public = :value OR viewable_apps.user_id = :userId', {
              value: true,
              organizationId: user.organizationId,
              userId: user.id,
            });
        })
      );
  }

  viewableAppsQb.andWhere('viewable_apps.organization_id = :organizationId', { organizationId: user.organizationId });
  viewableAppsQb.andWhere('viewable_apps.type = :type', { type: type });

  if (searchKey) {
    viewableAppsQb.andWhere('LOWER(viewable_apps.name) like :searchKey', {
      searchKey: `%${searchKey && searchKey.toLowerCase()}%`,
    });
  }
  viewableAppsQb.orderBy('viewable_apps.createdAt', 'DESC');
  return viewableAppsQb;
}

export function getFolderQuery(
  getAllFolders: boolean,
  allViewableAppIds: Array<string>,
  organizationId: string,
  type = 'front-end'
): SelectQueryBuilder<Folder> {
  const query = createQueryBuilder(Folder, 'folders');
  if (getAllFolders) {
    query.leftJoinAndSelect('folders.folderApps', 'folder_apps', 'folder_apps.app_id IN(:...allViewableAppIds)', {
      allViewableAppIds: [null, ...allViewableAppIds],
    });
  } else {
    query.innerJoinAndSelect('folders.folderApps', 'folder_apps', 'folder_apps.app_id IN(:...allViewableAppIds)', {
      allViewableAppIds: [null, ...allViewableAppIds],
    });
  }
  query
    .andWhere('folders.organization_id = :organizationId', {
      organizationId,
    })
    .andWhere('folders.type = :type', {
      type,
    })
    .orderBy('folders.name', 'ASC');
  return query;
}
