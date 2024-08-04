
import { auth, firestore } from '@/firebase';
import { Box, Button, Card, CardActions, CardContent, Checkbox, FormControl, InputLabel, MenuItem, Modal, Select, Stack, TextField, Typography } from '@mui/material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRecipeModal, setOpenRecipeModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('kg');
  const [currentItem, setCurrentItem] = useState({ id: '', name: '', quantity: 0, unit: 'kg' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        updateInventory();
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, inventory]);

  
  const getUserItemRef = (itemName) => {
    if (!user) return null;
    const userId = user.uid;
    return doc(collection(firestore, `users/${userId}/inventory`), itemName);
  };

  const updateInventory = async () => {
    if (!user) return;

    const userId = user.uid;
    const snapshot = query(collection(firestore, `users/${userId}/inventory`));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const handleUpdate = async () => {
    if (!currentItem.name.trim() || isNaN(Number(currentItem.quantity))) {
      alert("Invalid input");
      return;
    }
  
    const oldItemName = currentItem.id;
    const newItemName = currentItem.name.trim().toLowerCase();
    const newItemQuantity = Number(currentItem.quantity);
    const newItemUnit = currentItem.unit;
  
    if (newItemQuantity === 0) {
      // If the quantity is zero, remove the item
      await deleteDoc(doc(collection(firestore, `users/${user.uid}/inventory`), oldItemName));
    } else {
      // Delete the old item and add the new item with the new name
      await deleteDoc(doc(collection(firestore, `users/${user.uid}/inventory`), oldItemName));
  
      await setDoc(doc(collection(firestore, `users/${user.uid}/inventory`), newItemName), {
        name: newItemName,
        quantity: newItemQuantity,
        unit: newItemUnit
      });
    }
  
    await updateInventory();
    handleCloseEditModal();
  };

  const modifyItemQuantity = async (id, change) => {
    const docRef = getUserItemRef(id);
    if (!docRef) return;

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { name, quantity, unit } = docSnap.data();
      const newQuantity = quantity + change;

      if (newQuantity <= 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { name, quantity: newQuantity, unit });
      }
    }
    await updateInventory();
  };

  const addItem = async () => {
    if (!itemName.trim() || isNaN(Number(itemQuantity))) {
      alert('Invalid input');
      return;
    }

    const formattedItemName = itemName.trim().toLowerCase();
    const capitalizedItemName = formattedItemName.charAt(0).toUpperCase() + formattedItemName.slice(1);
    const docRef = getUserItemRef(capitalizedItemName);
    if (!docRef) return;

    const docSnap = await getDoc(docRef);
    const quantityToAdd = itemQuantity.trim() === '' ? 1 : Number(itemQuantity);

    if (docSnap.exists()) {
      const { unit } = docSnap.data();
      await setDoc(docRef, {
        quantity: (docSnap.data().quantity || 0) + quantityToAdd,
        unit: itemUnit
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        name: capitalizedItemName,
        quantity: quantityToAdd,
        unit: itemUnit
      });
    }
    await updateInventory();
    setItemName('');
    setItemQuantity('');
    setItemUnit('kg');
    handleClose();
  };

  const handleIngredientSelect = (id) => {
    setSelectedIngredients((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      } else if (prevSelected.length < 3) {
        return [...prevSelected, id];
      } else {
        alert("You can only select up to 3 ingredients.");
        return prevSelected;
      }
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filteredList = inventory.filter(item => item.name?.toLowerCase().includes(query.toLowerCase()));
      setFilteredInventory(filteredList);
    } else {
      setFilteredInventory(inventory);
    }
  };

  const handleOpenRecipeModal = () => setOpenRecipeModal(true);
  const handleCloseRecipeModal = () => setOpenRecipeModal(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenEditModal = (item) => {
    setCurrentItem({ ...item, id: item.id, quantity: String(item.quantity) });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login'; // Redirect to login page after sign out
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  updateInventory();

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"} padding={5} maxWidth="1200px" margin="0 auto">
      {user ? (
        <>
          <Typography variant='h5' marginBottom={2}>Welcome, {user.email}</Typography>
          <Button variant='contained' color='primary' onClick={handleSignOut}>Sign Out</Button>
          <Stack direction={"row"} spacing={2} marginTop={2} marginBottom={4} alignItems={"center"}>
            <Button variant='contained' color='primary' onClick={handleOpen}>Add New Item</Button>
            <TextField
              variant='outlined'
              placeholder='Search items'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              size='small'
            />
            <Button variant='contained' color='secondary' onClick={handleOpenRecipeModal}>Recipe</Button>
          </Stack>
        </>
      ) : (
        <Typography variant='h6'>Please <Link href='/login'>Log In</Link> or <Link href='/signup'>Sign Up</Link></Typography>
      )}
      <Stack spacing={3} width={"100%"}>
        {filteredInventory.map(({ id, name, quantity, unit }) => (
          <Card key={id} variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant='h6'>{name ? name.charAt(0).toUpperCase() + name.slice(1) : "Unnamed Item"}</Typography>
              <Typography variant='body1'>Quantity: {quantity || 0}</Typography>
              <Typography variant='body1'>Unit: {unit || "-"}</Typography>
            </CardContent>
            <CardActions>
              <Button variant='contained' color='success' onClick={() => modifyItemQuantity(id, 1)}>+</Button>
              <Button variant='contained' color='warning' onClick={() => modifyItemQuantity(id, -1)}>-</Button>
              <Button variant='contained' color='info' onClick={() => handleOpenEditModal({ id, name, quantity, unit })}>Edit</Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
      <Modal open={open} onClose={handleClose}>
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          width={400}
          bgcolor={"background.paper"}
          borderRadius={2}
          boxShadow={3}
          p={4}
          display={"flex"}
          flexDirection={"column"}
          gap={2}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant='h6'>Add Item</Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Name"
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Quantity"
              variant='outlined'
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                label="Unit"
              >
                <MenuItem value="-">-</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
                <MenuItem value="g">g</MenuItem>
                <MenuItem value="l">l</MenuItem>
                <MenuItem value="oz">oz</MenuItem>
                <MenuItem value="cup">cup</MenuItem>
              </Select>
            </FormControl>
            <Button variant='contained' color='primary' onClick={addItem}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={openRecipeModal} onClose={handleCloseRecipeModal}>
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          width={800}
          bgcolor={"background.paper"}
          borderRadius={2}
          boxShadow={3}
          p={4}
          display={"flex"}
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Box width="40%">
            <Typography variant='h6' marginBottom={2}>Pick 3 main ingredients to use:</Typography>
            <Stack direction="row" spacing={2} marginBottom={2}>
              <TextField
                variant='outlined'
                placeholder='Search ingredients'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                fullWidth
              />
              <Button variant='contained' color='primary' onClick={() => handleSearch(searchQuery)}>Generate</Button>
            </Stack>
            <Box>
              {filteredInventory.map(({ id, name }) => (
                <Box key={id} display="flex" alignItems="center" marginBottom={1}>
                  <Checkbox
                    checked={selectedIngredients.includes(id)}
                    onChange={() => handleIngredientSelect(id)}
                  />
                  <Typography>{name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Modal>
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          width={400}
          bgcolor={"background.paper"}
          borderRadius={2}
          boxShadow={3}
          p={4}
          display={"flex"}
          flexDirection={"column"}
          gap={2}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant='h6'>Edit Item</Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Name"
              variant='outlined'
              fullWidth
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            />
            <TextField
              label="Quantity"
              variant='outlined'
              fullWidth
              type="number"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={currentItem.unit}
                onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                label="Unit"
              >
                <MenuItem value="-">-</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
                <MenuItem value="g">g</MenuItem>
                <MenuItem value="l">l</MenuItem>
                <MenuItem value="oz">oz</MenuItem>
                <MenuItem value="cup">cup</MenuItem>
              </Select>
            </FormControl>
            <Button variant='contained' color='primary' onClick={handleUpdate}>Update</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
