<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * WhiteboardSpace
 *
 * @ORM\Table(name="Online_Comms.Whiteboard_Space", uniqueConstraints={@ORM\UniqueConstraint(name="Entry_ID_UNIQUE", columns={"Entry_ID"})},
 * indexes={@ORM\Index(name="fk_Whiteboard_Space_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Whiteboard_Space_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class WhiteboardSpace
{
    /**
     * @var string
     *
     * @ORM\Column(name="Entry_ID", type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $entryId;

    /**
     * @var \App\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorialRoomTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Edit_Time", type="datetime")
    */
    private $editTime;

    /**
     * @var string
     *
     * @ORM\Column(name="Num_Control_Points", type="integer")
     */
    private $numPoints;

    /**
     * Get entryId
     *
     * @return integer
     */
    public function getEntryId()
    {
        return $this->entryId;
    }

    /**
     * Set editTime
     *
     * @param \DateTime $editTime
     *
     * @return WhiteboardSpace
     */
    public function setEditTime($editTime)
    {
        $this->editTime = $editTime;

        return $this;
    }

    /**
     * Get editTime
     *
     * @return \DateTime
     */
    public function getEditTime()
    {
        return $this->editTime;
    }

    /**
     * Set numPoints
     *
     * @param integer $numPoints
     *
     * @return WhiteboardSpace
     */
    public function setNumPoints($numPoints)
    {
        $this->numPoints = $numPoints;

        return $this;
    }

    /**
     * Get numPoints
     *
     * @return integer
     */
    public function getNumPoints()
    {
        return $this->numPoints;
    }

    /**
     * Set roomId
     *
     * @param \App\Entity\TutorialRoomTable $roomId
     *
     * @return WhiteboardSpace
     */
    public function setRoomId(\App\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \App\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return WhiteboardSpace
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
