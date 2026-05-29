import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Message } from 'primereact/message';
import { listService } from '../api/list-api';

export const CreateCustomListForm = ({ visible, onHide, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newList = await listService.createCustomList(
        name.trim(),
        description.trim() || null,
        isPublic
      );
      
      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      
      // Success callback
      onSuccess?.(newList);
      onHide?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setError(null);
    onHide?.();
  };

  const dialogFooter = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={handleCancel} 
        className="p-button-text" 
        disabled={loading}
      />
      <Button 
        label={loading ? 'Creating...' : 'Create List'} 
        icon="pi pi-check" 
        onClick={handleSubmit}
        disabled={loading}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header="Create Custom List"
      visible={visible}
      className="dialog-md"
      footer={dialogFooter}
      onHide={handleCancel}
      modal
    >
      {error && (
        <Message severity="error" text={error} className="mb-3 w-full" />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label htmlFor="list-name" className="block mb-2">
            List Name <span className="text-red-500">*</span>
          </label>
          <InputText
            id="list-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Custom List"
            className="w-full"
            disabled={loading}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="list-description" className="block mb-2">
            Description (optional)
          </label>
          <InputTextarea
            id="list-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="List description..."
            rows={4}
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="field flex align-items-center gap-2 mt-3">
          <InputSwitch
            inputId="list-visibility"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.value)}
            disabled={loading}
          />
          <label htmlFor="list-visibility" className="mb-0">
            {isPublic ? 'Public' : 'Private'} list
          </label>
        </div>
      </form>
    </Dialog>
  );
};
