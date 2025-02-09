import React, { useState } from 'react'
import Delete from '@mui/icons-material/Delete'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useNavigate } from 'react-router-dom'
import styles from './UserCard.module.css'
import { UserParamsType } from '../../types/global'

interface UserCardProps {
  indb: IDBDatabase;
  user: UserParamsType;
  setMonitorMode: (user: UserParamsType) => void;
}

function UserCard(props: UserCardProps) {
  const phoneStr = `${props.user.phone.substring(0, 3)} **** **${props.user.phone.substring(9)}`
  const navigate = useNavigate()
  const [once, setOnce] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null)

  const removeUser = () => {
    let request = props.indb.transaction('user', 'readwrite').objectStore('user').delete(props.user.phone)
    request.onsuccess = (event) => {
      console.log('用户已被移除')
      handleClose()
      window.location.reload()
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX - 2,
          mouseY: event.clientY - 4,
        }
        : null,
    )
  }

  const handleClose = () => {
    setContextMenu(null)
  }

  const debounced = (fn: (params: any) => void, delay: number, params: any) => {
    let timeout: any = null;
    return function () {
      if (once) {
        fn(params);
        setOnce(false);
        return;
      }
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(fn, delay, params);
    }
  }

  const debouncedSetMonitor = debounced(props.setMonitorMode, 500, props.user);

  const handleMonitorChange = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();
    debouncedSetMonitor();
  }

  return (
    <Card sx={{
      display: 'inline-block',
      maxWidth: 345,
      minWidth: 300,
      backgroundColor: '#ecf0f3',
      marginBottom: 3.5,
      marginRight: 3.5,
      verticalAlign: 'bottom'
    }}
      onContextMenu={handleContextMenu}
      className={styles.neumCard}
    >
      <CardActionArea onClick={() => { navigate('/dash/' + props.user.phone) }}>
        <CardContent sx={{ position: 'relative' }}>
          <Typography variant="h5" align='left' component="div">
            <span className={styles.name}>{props.user.name}</span>
            <p>{phoneStr}</p>
          </Typography>
          <Typography sx={{ color: 'rgb(73, 85, 105)' }} variant="body2" align='right'>
            凭证日期：{new Date(props.user.date).toLocaleString()}
          </Typography>
          <span className={styles.monitorBtn + ' ' + (props.user.monitor === true ? styles.active : styles.inactive)}
            onClick={handleMonitorChange}
          >
            {props.user.monitor === true ? '监听' : '未监听'}
          </span>
        </CardContent>
      </CardActionArea>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={removeUser}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText>移除</ListItemText>
        </MenuItem>
      </Menu>
    </Card >
  )
}

export default UserCard