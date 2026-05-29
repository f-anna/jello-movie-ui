import React, { useState, useEffect, useCallback } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/users/context/auth-context';
import { userService } from '../features/users/api/user-api';
import { getAllMovies } from '../features/movies/api/movie-api';
import { adminApi } from '../features/admin/api/admin-api';
import { useJobStatus } from '../features/admin/hooks/useJobStatus';
import { getImageUrl } from '../lib/api-client';
import { MovieImportForm } from '../features/movies/components/movie-import-form';
import { MovieList } from '../features/movies/components/movie-list';
import './admin-page.css';

const JobStatusIndicator = ({ job, runningLabel }) => {
  if (job.running) {
    return (
      <div className="admin-job-status admin-job-status-running">
        <ProgressSpinner className="spinner-sm" />
        <span>{runningLabel}</span>
        {job.startedAt && (
          <span className="admin-job-status-meta">
            started {new Date(job.startedAt).toLocaleString()}
          </span>
        )}
      </div>
    );
  }
  if (job.lastFinishedAt) {
    return (
      <div className="admin-job-status admin-job-status-idle">
        <i className="pi pi-check-circle" />
        <span>Last finished {new Date(job.lastFinishedAt).toLocaleString()}</span>
      </div>
    );
  }
  return null;
};

const AdminPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [lists, setLists] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [moviesError, setMoviesError] = useState(null);
  const [listsError, setListsError] = useState(null);
  const [actionPending, setActionPending] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [fetchingRecent, setFetchingRecent] = useState(false);
  const [importedMovies, setImportedMovies] = useState([]);
  const syncJob = useJobStatus(adminApi.getSyncStatus);
  const fetchRecentJob = useJobStatus(adminApi.getFetchRecentStatus);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setUsersError(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadMovies = useCallback(async () => {
    setLoadingMovies(true);
    setMoviesError(null);
    try {
      const data = await getAllMovies();
      setMovies(data || []);
    } catch (err) {
      setMoviesError(err.message || 'Failed to load movies');
    } finally {
      setLoadingMovies(false);
    }
  }, []);

  const loadLists = useCallback(async () => {
    setLoadingLists(true);
    setListsError(null);
    try {
      const data = await adminApi.getAllLists();
      setLists(data || []);
    } catch (err) {
      setListsError(err.response?.data?.message || err.message || 'Failed to load lists');
    } finally {
      setLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadMovies();
    loadLists();
  }, [loadUsers, loadMovies, loadLists]);

  const showFeedback = (severity, text) => {
    setFeedback({ severity, text });
    window.setTimeout(() => setFeedback(null), 5000);
  };

  const handleDeleteUser = (target) => {
    confirmDialog({
      message: `Delete user "${target.userName || target.email}"? This cannot be undone.`,
      header: 'Delete user',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setActionPending(`user-delete-${target.id}`);
        try {
          await adminApi.deleteUser(target.id);
          setUsers((prev) => prev.filter((u) => u.id !== target.id));
          showFeedback('success', `User "${target.userName || target.email}" deleted.`);
        } catch (err) {
          showFeedback('error', err.response?.data?.message || err.message || 'Failed to delete user.');
        } finally {
          setActionPending(null);
        }
      },
    });
  };

  const handleTogglePromote = async (target) => {
    const isCurrentlyAdmin = target.isAdmin === true;
    setActionPending(`user-role-${target.id}`);
    try {
      if (isCurrentlyAdmin) {
        await adminApi.demoteFromAdmin(target.id);
      } else {
        await adminApi.promoteToAdmin(target.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, isAdmin: !isCurrentlyAdmin } : u))
      );
      showFeedback(
        'success',
        `${isCurrentlyAdmin ? 'Demoted' : 'Promoted'} "${target.userName || target.email}". User must log in again to see the change.`
      );
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to change role.');
    } finally {
      setActionPending(null);
    }
  };

  const handleDeleteList = (list) => {
    confirmDialog({
      message: `Delete list "${list.name}"? This cannot be undone.`,
      header: 'Delete list',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setActionPending(`list-delete-${list.id}`);
        try {
          await adminApi.deleteList(list.id);
          setLists((prev) => prev.filter((l) => l.id !== list.id));
          showFeedback('success', `List "${list.name}" deleted.`);
        } catch (err) {
          showFeedback('error', err.response?.data?.message || err.message || 'Failed to delete list.');
        } finally {
          setActionPending(null);
        }
      },
    });
  };

  const handleDeleteMovie = (movie) => {
    confirmDialog({
      message: `Delete movie "${movie.title}"? This cannot be undone.`,
      header: 'Delete movie',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setActionPending(`movie-delete-${movie.id}`);
        try {
          await adminApi.deleteMovie(movie.id);
          setMovies((prev) => prev.filter((m) => m.id !== movie.id));
          showFeedback('success', `Movie "${movie.title}" deleted.`);
        } catch (err) {
          showFeedback('error', err.response?.data?.message || err.message || 'Failed to delete movie.');
        } finally {
          setActionPending(null);
        }
      },
    });
  };

  const handleSync = () => {
    confirmDialog({
      message: 'Run TMDB sync now? This may take a while.',
      header: 'TMDB sync',
      icon: 'pi pi-sync',
      accept: async () => {
        setSyncing(true);
        try {
          await adminApi.syncTmdb();
          showFeedback('success', 'TMDB sync started.');
          syncJob.refresh();
        } catch (err) {
          showFeedback('error', err.response?.data?.message || err.message || 'TMDB sync failed.');
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  const handleFetchRecent = () => {
    confirmDialog({
      message: 'Fetch recent movies from TMDB now?',
      header: 'Fetch recent movies',
      icon: 'pi pi-clock',
      accept: async () => {
        setFetchingRecent(true);
        try {
          await adminApi.fetchRecentMovies();
          showFeedback('success', 'Recent movies fetch started.');
          fetchRecentJob.refresh();
        } catch (err) {
          if (err.response?.status === 409) {
            showFeedback('warn', 'Recent movies fetch is already running.');
            fetchRecentJob.refresh();
          } else {
            showFeedback('error', err.response?.data?.message || err.message || 'Fetch failed.');
          }
        } finally {
          setFetchingRecent(false);
        }
      },
    });
  };

  const userCellTemplate = (rowData) => (
    <div className="admin-user-cell">
      {rowData.profilePictureUrl ? (
        <img
          src={getImageUrl(rowData.profilePictureUrl)}
          alt=""
          className="admin-user-cell-avatar"
        />
      ) : (
        <span className="admin-user-cell-fallback">
          {(rowData.userName || rowData.email || '?').substring(0, 2).toUpperCase()}
        </span>
      )}
      <span>{rowData.userName || '—'}</span>
    </div>
  );

  const userRoleTemplate = (rowData) =>
    rowData.isAdmin ? (
      <Tag icon="pi pi-shield" severity="success" value="Admin" />
    ) : (
      <Tag value="User" severity="info" />
    );

  const userActionsTemplate = (rowData) => {
    const isSelf = rowData.id === currentUser?.id;
    return (
      <div className="admin-table-actions">
        <Button
          label={rowData.isAdmin ? 'Demote' : 'Promote'}
          icon={rowData.isAdmin ? 'pi pi-arrow-down' : 'pi pi-arrow-up'}
          size="small"
          severity={rowData.isAdmin ? 'warning' : 'success'}
          outlined
          loading={actionPending === `user-role-${rowData.id}`}
          disabled={isSelf}
          tooltip={isSelf ? "You can't change your own admin role" : undefined}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleTogglePromote(rowData)}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          size="small"
          severity="danger"
          outlined
          loading={actionPending === `user-delete-${rowData.id}`}
          disabled={isSelf}
          tooltip={isSelf ? "You can't delete your own account here" : undefined}
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleDeleteUser(rowData)}
        />
      </div>
    );
  };

  const moviePosterTemplate = (rowData) => (
    <img
      src={getImageUrl(rowData.posterPath)}
      alt=""
      className="admin-poster-cell"
      onError={(e) => { e.target.style.visibility = 'hidden'; }}
    />
  );

  const movieActionsTemplate = (rowData) => (
    <Button
      label="Delete"
      icon="pi pi-trash"
      size="small"
      severity="danger"
      outlined
      loading={actionPending === `movie-delete-${rowData.id}`}
      onClick={() => handleDeleteMovie(rowData)}
    />
  );

  const listNameTemplate = (rowData) => (
    <Link to={`/list/${rowData.id}`} className="admin-list-name-link">{rowData.name}</Link>
  );

  const listOwnerTemplate = (rowData) => {
    const owner = rowData.user;
    if (!owner) return rowData.userId ? <span>#{rowData.userId}</span> : '—';
    const label = owner.userName || owner.email || `#${owner.id}`;
    return <Link to={`/user/${owner.id}`} className="admin-list-name-link">{label}</Link>;
  };

  const listVisibilityTemplate = (rowData) =>
    rowData.isPublic ? (
      <Tag icon="pi pi-globe" value="Public" severity="success" />
    ) : (
      <Tag icon="pi pi-lock" value="Private" />
    );

  const listItemCountTemplate = (rowData) => rowData.listItems?.length ?? 0;

  const listActionsTemplate = (rowData) => (
    <Button
      label="Delete"
      icon="pi pi-trash"
      size="small"
      severity="danger"
      outlined
      loading={actionPending === `list-delete-${rowData.id}`}
      onClick={() => handleDeleteList(rowData)}
    />
  );

  return (
    <div className="admin-page-wrapper">
      <ConfirmDialog />
      <div className="admin-page-banner">
        <div className="admin-page-banner-text">
          <h1>
            <i className="pi pi-shield" /> Admin Panel
          </h1>
          <p>Manage users, movies, lists, and TMDB actions</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="admin-page-banner-logo"
        />
      </div>

      <div className="admin-page">

      {feedback && (
        <Message severity={feedback.severity} text={feedback.text} className="w-full mb-3" />
      )}

      <TabView>
        <TabPanel header="Users" leftIcon="pi pi-users mr-2">
          {usersError && <Message severity="error" text={usersError} className="w-full mb-3" />}
          {loadingUsers ? (
            <div className="admin-loading">
              <ProgressSpinner className="spinner-lg" />
            </div>
          ) : (
            <DataTable
              value={users}
              dataKey="id"
              paginator
              rows={20}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No users found."
              stripedRows
              tableStyle={{ minWidth: '100%' }}
            >
              <Column field="userName" header="User" body={userCellTemplate} sortable />
              <Column field="email" header="Email" sortable />
              <Column field="isAdmin" header="Role" body={userRoleTemplate} sortable style={{ width: '120px' }} />
              <Column header="Actions" body={userActionsTemplate} style={{ width: '260px' }} />
            </DataTable>
          )}
        </TabPanel>

        <TabPanel header="Movies" leftIcon="pi pi-video mr-2">
          {moviesError && <Message severity="error" text={moviesError} className="w-full mb-3" />}
          {loadingMovies ? (
            <div className="admin-loading">
              <ProgressSpinner className="spinner-lg" />
            </div>
          ) : (
            <DataTable
              value={movies}
              dataKey="id"
              paginator
              rows={20}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No movies found."
              stripedRows
              tableStyle={{ minWidth: '100%', tableLayout: 'fixed' }}
            >
              <Column header="Poster" body={moviePosterTemplate} style={{ width: '80px' }} />
              <Column field="title" header="Title" sortable style={{ width: 'calc((100% - 80px) / 4)' }} />
              <Column field="rating" header="Rating" sortable style={{ width: 'calc((100% - 80px) / 4)' }} />
              <Column field="tmdbId" header="TMDB ID" sortable style={{ width: 'calc((100% - 80px) / 4)' }} />
              <Column header="Actions" body={movieActionsTemplate} style={{ width: 'calc((100% - 80px) / 4)' }} />
            </DataTable>
          )}
        </TabPanel>

        <TabPanel header="Lists" leftIcon="pi pi-list mr-2">
          {listsError && <Message severity="error" text={listsError} className="w-full mb-3" />}
          {loadingLists ? (
            <div className="admin-loading">
              <ProgressSpinner className="spinner-lg" />
            </div>
          ) : (
            <DataTable
              value={lists}
              dataKey="id"
              paginator
              rows={20}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="No lists found."
              stripedRows
            >
              <Column field="name" header="Name" body={listNameTemplate} sortable />
              <Column header="Owner" body={listOwnerTemplate} />
              <Column field="isPublic" header="Visibility" body={listVisibilityTemplate} sortable style={{ width: '130px' }} />
              <Column header="Movies" body={listItemCountTemplate} style={{ width: '100px' }} />
              <Column header="Actions" body={listActionsTemplate} style={{ width: '140px' }} />
            </DataTable>
          )}
        </TabPanel>

        <TabPanel header="TMDB Actions" leftIcon="pi pi-sync mr-2">
          <div className="admin-sync-grid">
            <Card className="admin-sync-card">
              <h3>Sync from TMDB</h3>
              <p>
                Pull the latest data from TMDB into the local database. This is admin-only and
                may take a while depending on the volume.
              </p>
              <JobStatusIndicator job={syncJob.status} runningLabel="Sync running…" />
              <Button
                label="Run sync"
                icon="pi pi-sync"
                loading={syncing}
                disabled={syncJob.status.running}
                onClick={handleSync}
              />
            </Card>

            <Card className="admin-sync-card">
              <h3>Fetch recent movies</h3>
              <p>
                Trigger the recent-movies job manually to pull newly released titles from TMDB.
                Returns immediately; subsequent calls while the job is running are rejected.
              </p>
              <JobStatusIndicator job={fetchRecentJob.status} runningLabel="Fetch running…" />
              <Button
                label="Fetch recent"
                icon="pi pi-clock"
                loading={fetchingRecent}
                disabled={fetchRecentJob.status.running}
                onClick={handleFetchRecent}
              />
            </Card>

            <Card className="admin-sync-card">
              <h3>Import movie from TMDB</h3>
              <p>
                Import a single movie by its TMDB ID. The movie is added to the local database
                immediately.
              </p>
              <MovieImportForm onMovieImported={(movie) => setImportedMovies((prev) => [...prev, movie])} />
              <MovieList movies={importedMovies} />
            </Card>
          </div>
        </TabPanel>
      </TabView>
      </div>
    </div>
  );
};

export default AdminPage;
