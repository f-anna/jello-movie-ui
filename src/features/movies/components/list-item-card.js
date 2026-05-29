import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { listService } from '../api/list-api';
import { AddToListDialog } from './add-to-list-dialog';
import { getImageUrl, PLACEHOLDER_POSTER } from '../../../lib/api-client';
import { getRatingColor } from '../../../lib/utils';
import './list-item-card.css';

export const ListItemCard = ({ movie, listId, listItem, onRemoved, readOnly = false }) => {
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState(listItem?.comment || '');
  const [savingComment, setSavingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);
  const toast = useRef(null);

  const posterUrl = getImageUrl(movie.posterPath);

  const handleRemoveFromList = () => {
    confirmDialog({
      message: `Are you sure you want to remove "${movie.title}" from this list?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await listService.removeMovieFromList(listId, movie.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Movie removed from list',
            life: 3000,
          });
          onRemoved?.();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
            life: 3000,
          });
        }
      },
    });
  };

  const handleSaveComment = async () => {
    setSavingComment(true);
    try {
      if (comment.trim()) {
        await listService.updateComment(listId, movie.id, comment);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Comment saved',
          life: 3000,
        });
        listItem.comment = comment;
        setShowCommentDialog(false);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Comment cannot be empty',
          life: 3000,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000,
      });
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = () => {
    confirmDialog({
      message: 'Are you sure you want to delete this comment?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setDeletingComment(true);
        try {
          await listService.deleteComment(listId, movie.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Comment deleted',
            life: 3000,
          });
          listItem.comment = null;
          setComment('');
          onRemoved?.();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
            life: 3000,
          });
        } finally {
          setDeletingComment(false);
        }
      },
    });
  };

  const handleEditComment = () => {
    setComment(listItem?.comment || '');
    setShowCommentDialog(true);
  };

  const commentDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setComment(listItem?.comment || '');
          setShowCommentDialog(false);
        }}
        className="p-button-text"
        disabled={savingComment}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSaveComment}
        loading={savingComment}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      
      <Card className="list-item-card">
        <div className="list-item-card-content">
          <div className="list-item-card-poster">
            <Link to={`/movie/${movie.id}`}>
              <img
                src={posterUrl}
                alt={movie.title}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_POSTER;
                }}
              />
            </Link>
          </div>

          <div className="list-item-card-info">
            <div className="list-item-card-header">
              <Link to={`/movie/${movie.id}`} className="list-item-card-title-link">
                <h3 className="list-item-card-title">{movie.title}</h3>
              </Link>
              {movie.voteAverage > 0 && (
                <Tag
                  value={movie.voteAverage.toFixed(1)}
                  severity={getRatingColor(movie.voteAverage)}
                  icon="pi pi-star-fill"
                />
              )}
            </div>

            {movie.releaseDate && (
              <p className="list-item-card-year">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}

            {movie.overview && (
              <p className="list-item-card-overview">{movie.overview}</p>
            )}

            {listItem?.comment && (
              <div className="list-item-card-comment">
                <div className="list-item-card-comment-content">
                  <i className="pi pi-comment" />
                  <span>{listItem.comment}</span>
                </div>
                {!readOnly && (
                  <div className="list-item-card-comment-actions">
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-text p-button-sm p-button-rounded"
                      onClick={handleEditComment}
                      tooltip="Edit comment"
                      disabled={deletingComment}
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-text p-button-sm p-button-rounded p-button-danger"
                      onClick={handleDeleteComment}
                      loading={deletingComment}
                      tooltip="Delete comment"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="list-item-card-actions">
            {!readOnly && (
              <>
                <Button
                  icon="pi pi-comment"
                  label={listItem?.comment ? "Edit Comment" : "Add Comment"}
                  className="p-button-text"
                  onClick={handleEditComment}
                  tooltip={listItem?.comment ? "Edit comment" : "Add comment"}
                />
                <Button
                  icon="pi pi-plus"
                  label="Add to List"
                  className="p-button-text"
                  onClick={() => setShowAddToListDialog(true)}
                  tooltip="Add to another list"
                />
                <Button
                  icon="pi pi-trash"
                  label="Remove"
                  className="p-button-text p-button-danger"
                  onClick={handleRemoveFromList}
                  tooltip="Remove from this list"
                />
              </>
            )}
            {readOnly && (
              <Button
                icon="pi pi-plus"
                label="Add to List"
                className="p-button-text"
                onClick={() => setShowAddToListDialog(true)}
                tooltip="Add to your list"
              />
            )}
          </div>
        </div>
      </Card>

      <AddToListDialog
        visible={showAddToListDialog}
        onHide={() => setShowAddToListDialog(false)}
        movieId={movie.id}
        movieTitle={movie.title}
      />

      <Dialog
        header={`Comment for "${movie.title}"`}
        visible={showCommentDialog}
        className="dialog-lg"
        footer={commentDialogFooter}
        onHide={() => {
          setComment(listItem?.comment || '');
          setShowCommentDialog(false);
        }}
        modal
      >
        <div className="field">
          <InputTextarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full"
            placeholder="Add your thoughts about this movie..."
          />
        </div>
      </Dialog>
    </>
  );
};
