const FormActions = ({ isSubmitting, handleSubmit, resetForm }) => (
  <div className="form-actions">
    <button type="button" className="btn-secondary" onClick={resetForm}>
      Réinitialiser
    </button>
    <button type="submit" className={`btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
      {isSubmitting ? 'Enregistrement...' : 'Enregistrer le rapport'}
    </button>
  </div>
);

export default FormActions;
