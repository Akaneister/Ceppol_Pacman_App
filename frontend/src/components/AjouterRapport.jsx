import React from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";

export default function AjouterRapport() {
  const [status, setStatus] = React.useState("");
  const [form, setForm] = React.useState({
    titre: "",
    description: "",
    type: "",
    urgent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    // ...envoi du formulaire...
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Ajouter un rapport
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Merci de remplir les informations ci-dessous.
        </Typography>
        {status === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Rapport ajouté avec succès !
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Titre"
                name="titre"
                value={form.titre}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="incident">Incident</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="urgent"
                    checked={form.urgent}
                    onChange={handleChange}
                  />
                }
                label="Urgent"
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "right" }}>
              <Button variant="contained" color="primary" type="submit">
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}