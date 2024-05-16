import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((_) => ({
  title: {
    flexGrow: 1,
  },
}));

export default function Navbar() {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title} align="left">
          <span className="font-bold">ERC20 Token Market</span>
        </Typography>
        <Button color="inherit" onClick={() => navigate("/")}>
          User Details
        </Button>
        <Button color="inherit" onClick={() => navigate("/swap")}>
          Swap tokens
        </Button>
        <Button color="inherit" onClick={() => navigate("/createToken")}>
          Create Token
        </Button>
        <Button color="inherit" onClick={() => navigate("/createLP")}>
          Create LP
        </Button>
        <Button color="inherit" onClick={() => navigate("/buy")}>
          Buy Tokens
        </Button>
      </Toolbar>
    </AppBar>
  );
}
